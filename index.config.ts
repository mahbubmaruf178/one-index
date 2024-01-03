// export const AllDrivers: DriverConfig[] = [
//   {
//     path: "onedrivetwo", // should be unique for each driver , space not allowed ,
//     type: "onedrive",
//     refreshtoken:
//       "YOur refresh token here from https://alist.nn.ci/tool/onedrive/request.html",
//   },
//   {
//     path: "onedriveone", // should be unique for each driver , space not allowed ,
//     type: "onedrive",
//     refreshtoken:
//         "YOur refresh token here from https://alist.nn.ci/tool/onedrive/request.html",
//   },
//   {
//     path: "gdrive", // should be unique for each driver
//     type: "googledrive",
//     refreshtoken: "your_google_drive_refresh_token_here",
//   },
// ];
export const AllDrivers: DriverConfig[] = [
    {
        path: "onedrivetwo", // should be unique for each driver , space not allowed ,
        type: "onedrive",
        refreshtoken:
            "M.C106_BAY.-CZgOAqRgWQF0ClGIlGzcJ4SKjRQfUJM3tB0oOOYFrV4Ny7fhMGr1eEvSXX69ioiVnTtqRhs099j8TKyDX5xgGxcnYrrJzZMwrh5V0fvLTJBSPKUwPyee3Quz3asv4U87di!0df5rB0!VvcxuLTTvzvZ43JKJS*1*qjdMd92mqp4dObj0Tx4171ZQHKKWrCmFg!G6YvDFAhIq!VB0SHDiHRax*mqTBZTTNGb!aKVdFLsj4Geppfu758oitaESamOvNfOHMAKv9HCRYUOMvYk63tNUW4cAEc0JroUmI3FMuegJtdJ7Fb0SlGG1GfXI67ySFoBfGjDxdij6Nrv23GTBQ7H3zbbRjRyUfCNN1!ZggnWr4TDPerJWMsdxJ4YtGmX2isW49uYV63tQA!0MbUlsqd8b9YWJMgJ6ax1GhSywD!Q3ZfcL1v0JpzpS1FFmGGiiQprYTPqIsteIf0UT21oWbole3NHDaIT25HXc0C4t6pBY",
    },
    {
        path: "onedriveone", // should be unique for each driver , space not allowed ,
        type: "onedrive",
        refreshtoken:
            "0.AUoAJGMhXWgu7E-pXfpN7WNVxqORKQp0FjRDhWFnHMc0mWCJAJY.AgABAAEAAAAmoFfGtYxvRrNriQdPKIZ-AgDs_wUA9P-R8QXtGjxcpDuTmNQeS0pou7R20FnzY_-fyFnuTa3KD0jarC1EUt_z6HnDepwrJlh4RA3Z72LZrl14WAjO2pg3bOwXV_30Nuo2jUEkd73ogOhqOj3dYqtNravKr1EC3GqlXvg3jwfT6_cCSDXjxWOAaeZhp_6X4dJVnAjuBdPc2f0tf4KCuA-zW-G4tpJmeJya2Yx98VRqnQfzNfVBazsemDf8U1trqhsMyuWMZTxFXSIMJf5Y7MtecQeNWx0wMXteJTeZxsQSZXTxdgW92ibFSHecrMPahVFXnllmr5hr0DWFB6nRKWy76MXrWoNLfdmgx-LiM7Cz_Rfa5gmN6LR8Pia2A0vW5JW6TDG-WAe1wP0lM-ZrizQuaytBFoxEZiKYHY5yRhzPLbNlSDcOVjzeO8BhJTKi2jtr4SCk4NjPg7D72vJ5pcTmrVG6NKNobyuZb7lkA323irBpgPR6MAGFZD4T4AP3_eG4EvNMI8DsqK1KOaGTLyXDcP95vJxTuLeJTNb8m7ky7yacTbeBmQGc7kCzZJJ4J8y77EX3wWf5xTwJ7IsZcIExa-M8neGM6HcbblUzH6d4Ab8y68DX8wMji7Ue15pmaZeVS0G4nJELmQFt9esb6IOnONEY1AJg8Ftpa0VE_Kb1CbfEMiSX5XqHFO4U-O7Q6U_Qwix9lYqssvXYIoQcXpv6SJq65BlqCp9I3m-WTR6m4EuFTvjgL17xz82VR3PwsWtls-qL17RXY45TuhD7gSr4Ix1FfwRpJ26zI1Em95OMyVtk3B9p8KkW",
    },
    {
        path: "gdrive", // should be unique for each driver
        type: "googledrive",
        refreshtoken: "your_google_drive_refresh_token_here",
    },
];

// __ Dot Touch __ if you don't know what you are doing below
interface DriverIF {
  List(id?: string): Promise<DriveList[]>; // id is optional
  Search(name: string): Promise<DriveList[]>;
  GetFile(id: string): Promise<Response>;
}
export interface DriveList {
  name: string;
  id : string;
  size: number;
  type: string;
}
interface DriverConfig {
  path: string;
  type: "onedrive" | "googledrive";
  refreshtoken: string;
}

//  get driver by path
export function GetDriver(path: string): DriverIF {
  const driver = AllDrivers.find((d) => {
    return d.path === path;
  });
  if (!driver) {
    throw new Error("Driver not found");
  }

  switch (driver.type) {
    case "onedrive":
      return new OneDrive(driver.refreshtoken);
    case "googledrive":
      return new GDrive(driver.refreshtoken);
    default:
      throw new Error("Driver not found");
  }
}
class OneDrive implements DriverIF {
  private accessToken: string;
  private readonly refreshToken: string;
  constructor(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  private async loadToken() {
    try {
        const token = await this.fetchAccessToken(this.refreshToken);
        this.accessToken = token;
        return token;

    } catch (error) {
      console.log("error", error);
      throw new Error("Error fetching access token");
    }

  }
  private async fetchAccessToken(refreshToken: string): Promise<string> {
    // this.accesstoken =   (refreshToken):string => {
      const client_id = "0a2991a3-1674-4334-8561-671cc7349960";
      const client_secret = "uw67Q~TCMqdJyH35hlcHHclv~mhNOGx.jfPFm";
      const redirect_uri = "https://alist.nn.ci/tool/onedrive/callback";
      const token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
      const req = await fetch(token_url, {
        method: "POST",
        body: `client_id=${client_id}&scope=offline_access%20Files.ReadWrite.All&refresh_token=${refreshToken}&redirect_uri=${redirect_uri}&grant_type=refresh_token&client_secret=${client_secret}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
        const data = await req.json();
      this.accessToken = data.access_token;

        return data.access_token;
  }
   async List(id?: string): Promise<DriveList[]> {
 await this.loadToken();
     let url = "";
     if (id) {
       url = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/children`;
     } else {
       url = `https://graph.microsoft.com/v1.0/me/drive/root/children`;
     }
     const request = await fetch(url, {
       headers: {
         Authorization: `Bearer ${this.accessToken}`,
       },
     });

     const data = await request.json();
     // console.log("data", data)
     return data.value.map((item: any) => {
       return {
         name: item.name,
         size: item.size,
            id: item.id,
         type: item.file ? "file" : "folder",
       }
     })
   }

  async GetFile(id: string): Promise<Response> {
    await this.loadToken();
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
    };

    const response = await fetch(url, { headers });

    const disposition = response.headers.get('content-disposition');
    const filename = decodeURIComponent(
        disposition
            ?.substring(disposition.indexOf('utf-8') + 7)
            .replace(/['"]/g, '')
            .replace(';', '')
            .replace('filename=', '') || ''
    );

    return new Response(response.body, {
      status: 200, // OK
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }


  Search(name: string): Promise<DriveList[]> {
    return Promise.resolve([]);
  }
}

class GDrive implements DriverIF {
  public token: string;

  constructor(token: string) {
    this.token = token;
  }

  async List(id?: string): Promise<DriveList[]> {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/drives/${id}/root/children`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
    const data = await response.json();
    return data.value;
  }
  async GetFile(id: string): Promise<Response> {
    return new Response("Not implemented");
  }

  async Search(name: string): Promise<DriveList[]> {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/root/search(q='${name}')`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );
    const data = await response.json();
    return data.value;
  }
}
