import { AllDrivers } from "./oneindexconf";

export interface DriveItems {
  name: string;
  id: string;
  size: number;
  type: string;
  data?: any;
  thumbnail?: string;
}
export interface Driverer {
  List(id?: string): Promise<DriveItems[]>; // id is optional
  Search(name: string): Promise<DriveItems[]>;
  GetFile(id: string, request: any): Promise<Response>;
  FetchAccessToken(
    client_id,
    client_secret,
    redirect_uri,
    token_url,
    refreshToken
  ): Promise<string>;
}

interface config {
  ClientID: string;
  ClientSecret: string;
  redirect_url?: string;
  RefreshToken: string;
}
export interface DriverConfig {
  name: string;
  path: string;
  type: "onedrive" | "googledrive";
  config: config;
}

//  get driver by path
export async function GetDriver(path: string): Promise<Driverer> {
  const driver = AllDrivers.find((d) => {
    return d.path === path;
  });
  if (!driver) {
    throw new Error("Driver not found");
  }

  switch (driver.type) {
    case "onedrive":
      const od = new OneDrive();
      await od.FetchAccessToken(
        driver.config.ClientID,
        driver.config.ClientSecret,
        driver.config.redirect_url,
        "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        driver.config.RefreshToken
      );
      return od;
    default:
      throw new Error("Driver not found");
  }
}

class OneDrive implements Driverer {
  private accessToken: string;
  public async FetchAccessToken(
    client_id: string,
    client_secret: string,
    redirect_uri: string,
    token_url: string,
    refreshToken: string
  ): Promise<string> {
    try {
      const req = await fetch(token_url, {
        method: "POST",
        body: `client_id=${client_id}&scope=offline_access%20Files.ReadWrite.All&refresh_token=${refreshToken}&redirect_uri=${redirect_uri}&grant_type=refresh_token&client_secret=${client_secret}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (!req.ok) {
        throw new Error(`Request failed with status ${req.status}`);
      }

      const data = await req.json();
      this.accessToken = data.access_token;
      console.log("access token", data);

      return data.access_token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  async List(id?: string): Promise<DriveItems[]> {
    let url = "";
    if (id) {
      url = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/children?$top=5000&$expand=thumbnails($select=medium)&$select=id,name,size,lastModifiedDateTime,content.downloadUrl,file,parentReference`;
    } else {
      url =
        "https://graph.microsoft.com/v1.0/me/drive/root/children?$top=5000&$expand=thumbnails($select=medium)&$select=id,name,size,lastModifiedDateTime,content.downloadUrl,file,parentReference";
    }
    const request = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await request.json();

    // return data.value.map((item: any) => {
    //   return {
    //     name: item.name,
    //     size: item.size,
    //     id: item.id,
    //     type: item.file ? item.file.mimeType : "folder",
    //     thumbnail:
    //       item.thumbnails && item.thumbnails.length > 0
    //         ? item.thumbnails[0].medium.url
    //         : null,
    //     date: item.lastModifiedDateTime,
    //   };
    // });
    //  sort by new date
    const sorted = data.value.map((item: any) => {
      return {
        name: item.name,
        size: item.size,
        id: item.id,
        type: item.file ? item.file.mimeType : "folder",
        thumbnail:
          item.thumbnails && item.thumbnails.length > 0
            ? item.thumbnails[0].medium.url
            : null,
        data: item,
      };
    });
    sorted.sort((a, b) => {
      return (
        +new Date(b.data.lastModifiedDateTime) -
        +new Date(a.data.lastModifiedDateTime)
      );
    });
    return sorted;
  }

  async GetFile(id: string, request: any): Promise<Response> {
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`;
    const myheaders = {
      Authorization: `Bearer ${this.accessToken}`,
    };
    try {
      if (request.headers.get("Range" || "range")) {
        console.log("got partial content request");
        myheaders["Range"] = request.headers.get("Range" || "range");
        const response = await fetch(url, { headers: myheaders });
        const contentRange = response.headers.get("Content-Range");
        const contentLength = response.headers.get("Content-Length");
        const disposition = response.headers.get("content-disposition");
        const filename = decodeURIComponent(
          disposition
            .substring(disposition.indexOf("utf-8") + 7)
            .replace(/['"]/g, "")
            .replace(";", "")
            .replace("filename=", "")
        );
        return new Response(response.body, {
          status: 206, // Partial Content
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Range": contentRange,
            "Content-Length": contentLength,
            "Accept-Ranges": "bytes",
          },
        });
      } else {
        const Head = new Headers();
        Head.set("Authorization", `Bearer ${this.accessToken}`);
        try {
          return await fetch(url, { headers: Head });
        } catch (error) {
          return new Response("api limited, cant handle request ", {
            status: 500,
          });
        }
      }
    } catch (error) {
      return new Response("api limited, cant handle request ", {
        status: 500,
      });
    }
  }

  Search(name: string): Promise<DriveItems[]> {
    return Promise.resolve([]);
  }
}
