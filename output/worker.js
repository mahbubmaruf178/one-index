const client_id = '0a2991a3-1674-4334-8561-671cc7349960';
const client_secret = 'uw67Q~TCMqdJyH35hlcHHclv~mhNOGx.jfPFm';
const redirect_uri = 'https://alist.nn.ci/tool/onedrive/callback';
const refresh_token = 'Your Refresh Token';
const token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
// src/html.js
function DriveItemsHtml(json, pathdomain) {
	var html = Htmlbody(`
    <div class="header bg-blue-500 text-white py-4">
    <h1 class="text-3xl font-semibold text-center">Drive Items</h1>
</div>
<div class=" grid gap-4 grid-cols-1  lg:grid-cols-3 m-2">
    ${(function () {
			let generatedHtml = '';
			for (let i = 0; i < json.value.length; i++) {
				const item = json.value[i];
				generatedHtml += `
                <div class="drive-item bg-white p-4 rounded-md shadow-md text-blue-400">
              <div class="flex items-center mb-2 overflow-hidden">
    <i class="${item.folder ? 'fas fa-folder text-blue-500' : 'fas fa-file text-blue-500'} text-2xl mr-2"></i>
    ${
			item.folder
				? `<a href="/bypath?id=${item.id}" class="text-lg font-semibold text-blue-500 hover:underline no-wrap" style="white-space: nowrap;">${item.name}</a>`
				: `<a href="/download?id=${item.id}" class="text-lg font-semibold text-gray-500 hover:underline no-wrap" style="white-space: nowrap;">${item.name}</a>`
		}
</div>


                   <p class="text-gray-600">
    ${
			item.size
				? item.size >= 1024 * 1024 * 1024
					? (item.size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
					: (item.size / 1024 / 1024).toFixed(2) + ' MB'
				: 'N/A'
		}
</p>

                    ${
											item.folder
												? ``
												: `     
<div class="flex flex-row items-center gap-2">
    <a href="/download?id=${item.id}" class="inline-block text-center border rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
        <i class="fas fa-download"></i> Download

    </a>
<a href="intent:${pathdomain}/download/?id=${item.id}#Intent;type=video/mp4;end" class="inline-block text-center border rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
  <i class="fas fa-play-circle"></i> Open
</a>

    <button class="inline-block text-center border rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600" onclick="copyLink('${pathdomain}/download/?id=${item.id}')">
        <i class="fas fa-copy"></i> Copy URL
    </button>
</div>

`
										}
                </div>
            `;
			}
			return generatedHtml;
		})()}
</div>
<script>
    function copyLink(link) {
        navigator.clipboard.writeText(link);
    }
</script>

    </script>
`);
	return html;
}
function Htmlbody(innerhtml) {
	var html = `
	<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
   <script src="https://cdn.tailwindcss.com"></script>
	<title>OneDrive</title>
	<link rel="icon" href="https://www.onedrive.com/favicon.ico" type="image/x-icon">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">


	</head>
  <style>
	body {
		font-family: Arial, sans-serif;
		background-color: #f5f5f5;
		margin: 0;
		padding: 0;
				}
	  </style>

	<body>
	<nav class="bg-blue-500 py-4">
    <div class="container mx-auto">
        <div class="flex justify-between items-center">
            <a href="/" class="text-white hover:underline">
                <div class="text-white font-semibold text-lg">Home</div>
            </a>
            <div class="flex  ">
                <form class="flex gap-2">
                    <input type="text" name="search" placeholder="Search" class="border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 px-2 py-1">
                    <button type="submit" class="bg-blue-200 text-gray-900 rounded-md hover:bg-blue-100 focus:outline-none px-4 py-2">Search</button>
                </form>
            </div>
        </div>
    </div>
</nav>


	${innerhtml}
	</body>
</html>`;
	return html;
}

// src/index.js
var src_default = {
	async fetch(request) {
		const { pathname } = new URL(request.url);
		const accessToken = await getAccessToken();
		const pathdomain = new URL(request.url).origin;
		if (pathname.startsWith('/bypath')) {
			const { searchParams } = new URL(request.url);
			const id = searchParams.get('id');
			const url2 = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/children`;
			const init2 = {
				method: 'GET',
				headers: {
					Authorization: 'Bearer ' + accessToken,
				},
			};
			try {
				const response2 = await fetch(url2, init2);
				const json2 = await response2.json();
				var html = DriveItemsHtml(json2, pathdomain);
				console.log(json2);
				return new Response(html, {
					headers: {
						'content-type': 'text/html',
					},
				});
			} catch (error) {
				console.error('Error fetching drive items:', error);
			}
		}
		if (pathname.startsWith('/download')) {
			const { searchParams } = new URL(request.url);
			const id = searchParams.get('id');
			const url2 = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`;
			const requestHeaders = request.headers;
			for (const [key, value] of requestHeaders) {
				console.log(`${key} = ${value}`);
			}
			const headers = {
				Authorization: `Bearer ${accessToken}`,
			};
			try {
				if (requestHeaders.get('Range')) {
					headers['Range'] = requestHeaders.get('Range');
					const response2 = await fetch(url2, { headers });
					const contentRange = response2.headers.get('Content-Range');
					const contentLength = response2.headers.get('Content-Length');
					const disposition = response2.headers.get('content-disposition');
					const filename = decodeURIComponent(
						disposition
							.substring(disposition.indexOf('utf-8') + 7)
							.replace(/['"]/g, '')
							.replace(';', '')
							.replace('filename=', '')
					);
					return new Response(response2.body, {
						status: 206,
						headers: {
							'Content-Type': 'application/octet-stream',
							'Content-Disposition': `attachment; filename="${filename}"`,
							'Content-Range': contentRange,
							'Content-Length': contentLength,
							'Accept-Ranges': 'bytes',
						},
					});
				} else {
					const response2 = await fetch(url2, { headers });
					const disposition = response2.headers.get('content-disposition');
					const filename = decodeURIComponent(
						disposition
							.substring(disposition.indexOf('utf-8') + 7)
							.replace(/['"]/g, '')
							.replace(';', '')
							.replace('filename=', '')
					);
					return new Response(response2.body, {
						status: 200,
						headers: {
							'Content-Type': 'application/octet-stream',
							'Content-Disposition': `attachment; filename="${filename}"`,
						},
					});
				}
			} catch (error) {
				console.error('Error downloading file:', error);
				return new Response('Error downloading the file.', {
					status: 500,
				});
			}
		}
		const url = `https://graph.microsoft.com/v1.0/me/drive/root/children`;
		const init = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + accessToken,
			},
		};
		const response = await fetch(url, init);
		const json = await response.json();
		var home = DriveItemsHtml(json, pathdomain);
		return new Response(home, {
			headers: {
				'content-type': 'text/html',
			},
		});
	},
};
async function getAccessToken() {
	const reqdata = await fetch(token_url, {
		method: 'POST',
		body: `client_id=${client_id}&scope=offline_access%20Files.ReadWrite.All&refresh_token=${refresh_token}&redirect_uri=${redirect_uri}&grant_type=refresh_token&client_secret=${client_secret}`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
	const data = await reqdata.json();
	const accessToken = data.access_token;
	return accessToken;
}
export { src_default as default };
//# sourceMappingURL=index.js.map
