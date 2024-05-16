export async function GET({ params, request }) {
  const clientUrl = new URL(request.url);
  const url = clientUrl.searchParams.get("url");
  const myheaders = {};
  let filename: string = "";
  let contentRange: string = "";
  let contentLength: string = "";

  try {
    const rangeHeader =
      request.headers.get("Range") || request.headers.get("range");
    if (rangeHeader) {
      //   console.log("got partial content request");
      myheaders["Range"] = rangeHeader;
    }

    const response = await fetch(url, { headers: myheaders });
    contentRange = response.headers.get("Content-Range");
    contentLength = response.headers.get("Content-Length");

    if (response.headers.has("content-disposition")) {
      const contentDisposition = response.headers.get("content-disposition");
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    } else {
      // get filename from url
      filename = url.substring(url.lastIndexOf("/") + 1);
    }

    return new Response(response.body, {
      status: rangeHeader ? 206 : 200, // Partial Content or OK
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Range": contentRange,
        "Content-Length": contentLength,
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.log("error", error);
    return new Response("internal error", {
      status: 500,
    });
  }
}
