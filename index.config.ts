export const AllDrivers: DriverConfig[] = [
  {
    path: "onedrivetwo", // should be unique for each driver , space not allowed ,
    type: "onedrive",
    refreshtoken:
      "YOur refresh token here from https://alist.nn.ci/tool/onedrive/request.html",
  },
  {
    path: "onedriveone", // should be unique for each driver , space not allowed ,
    type: "onedrive",
    refreshtoken:
        "YOur refresh token here from https://alist.nn.ci/tool/onedrive/request.html",
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

    GetFile(id: string, request: any): Promise<Response>;
}

export interface DriveList {
    name: string;
    id: string;
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
        if (!this.accessToken) {
            await this.loadToken();
        }
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

    async GetFile(id: string, request: any): Promise<Response> {
        if (!this.accessToken) {
            await this.loadToken();
        }
        const url = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`;
        const myheaders = {
            'Authorization': `Bearer ${this.accessToken}`
        };
        try {
            if (request.headers.get('Range'||"range")) {
                console.log("got partial content request")
                myheaders['Range'] = request.headers.get('Range'||"range");
                const response = await fetch(url, { headers: myheaders });
                const contentRange = response.headers.get('Content-Range');
                const contentLength = response.headers.get('Content-Length');
                const disposition = response.headers.get('content-disposition');
                const filename = decodeURIComponent(
                    disposition
                        .substring(disposition.indexOf('utf-8') + 7)
                        .replace(/['"]/g, '')
                        .replace(';', '')
                        .replace('filename=', '')
                );
                return new Response(response.body, {
                    status: 206, // Partial Content
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Disposition': `attachment; filename="${filename}"`,
                        'Content-Range': contentRange,
                        'Content-Length': contentLength,
                        'Accept-Ranges': 'bytes',
                    },
                });
            } else {
                return  fetch(url, { headers: myheaders });
                }

        } catch (error) {
            return new Response('api limited, cant handle request ', {
                status: 500
            });
        }
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

    async GetFile(id: string, request: any): Promise<Response> {
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
