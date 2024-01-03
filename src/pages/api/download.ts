import {GetDriver} from "../../oi-config.ts";
export async function GET({ request}) {
    const url  = new URL(request.url)
    const id = url.searchParams.get('id')
   const path =  url.searchParams.get('path')
    const driver =  GetDriver(path)
    return  driver.GetFile(id)
}