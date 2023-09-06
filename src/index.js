import { DriveItemsHtml } from './html.js';

const client_id = 'dd8b4a2e-5bad-4256-b0f9-c360b51fde67';
const client_secret = 'iZh8Q~oYe1jKZ~UbIXAUqDTx1tuYzNQBY706Eces';
const refresh_token =
	'0.AUoAJGMhXWgu7E-pXfpN7WNVxi5Ki92tW1ZCsPnDYLUf3meJAJY.AgABAAIAAAAtyolDObpQQ5VtlI4uGjEPAgDs_wUA9P9QTNejoJgUC5ZXUfOc_UH6lVMoLVHCslzibPclXPkWTOcz9GdSx2R63wYFz6jBeE-p_MhpPLkS0LatPYYSjJlOlOPPa21Y1yczPfMj9HM0On77FQ7fxtoJxuIKeJyv7b0_636Xgg4kawt_fA7Ftn29WFcYpH_vWpILm_Kj5R12m3Tpx9m1B3qjWDYqf23wNBLoxNTAt1zQdBvIzJWe0gUiKhZfw_YB3tTNg-eAE1CvpFyJ-EkGXjtz4h33ePPham215OuOf9Q1aiND-AveVRl9jScCO086g_CTerLTYCu0vJW6P3tdOQNNY6V5SwK7r-nmg-D8wH4RYxr5M_lAprU4oEOlxfdYMHjgywKehQd-e1LyWVWCVdfeiekZpWRxZ3oLv48X4Qi_vZbTjNOpkrcQEewIyuIzJ3CJMcGwzkwOefrjzKXy8v_FxxRqz1XZNtnIpAqKxNI3eRgbdketxDrzgzqbTMYmoAidevtkpFFgSBgSumvX69KkNDRlagN9QAv9XjaYZD-Ees89W7rP0wwakC7gGDRu2-JCFtL5ugPAmyWq1cXbyxOQtYPk_o0AUs03P8NQ8v9rQRVVn73jusMTk9mLN5Yx0bAaBrvWZyHsCmrl-oRRM5hcBzrBdYtoRj-9hWNI4aV93voavLDzT889ZHIc2xQokBb-rT2dHFXWVmgYtnhr_X0yhScLrapl08tsPvJV23zJrm5QGwqIb5u5MAb8U1c45w';

export default {
	async fetch(request) {
		// routes
		const { pathname } = new URL(request.url);
		const accessToken = await getAccessToken();
		// get domain from request
		const pathdomain = new URL(request.url).origin;
		if (pathname.startsWith('/bypath')) {
			// const id = '0162GLWGF6Y2GOVW7725BZO354PWSELRRZ';
			const { searchParams } = new URL(request.url);
			const id = searchParams.get('id');
			const url = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/children`;

			const init = {
				method: 'GET',
				headers: {
					Authorization: 'Bearer ' + accessToken,
				},
			};

			try {
				const response = await fetch(url, init);
				const json = await response.json();
				var html = DriveItemsHtml(json, pathdomain);

				console.log(json);

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

			const url = `https://graph.microsoft.com/v1.0/me/drive/items/${id}/content`;
			// get headeres from request
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
					const response = await fetch(url, { headers });
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
							'Accept-Ranges': 'bytes', // Indicate support for byte-range requests
						},
					});
				} else {
					const response = await fetch(url, { headers });
					const disposition = response.headers.get('content-disposition');
					const filename = decodeURIComponent(
						disposition
							.substring(disposition.indexOf('utf-8') + 7)
							.replace(/['"]/g, '')
							.replace(';', '')
							.replace('filename=', '')
					);
					return new Response(response.body, {
						status: 200, // OK
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
async function getAccessToken(request) {
	var scope = ' User.Read Files.Read.All Files.Read.All User.Read.All User.ReadBasic.All';
	var url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
	var body =
		'grant_type=refresh_token&client_id=' +
		client_id +
		'&scope=' +
		scope +
		'&refresh_token=' +
		refresh_token +
		'&client_secret=' +
		client_secret;
	var init = {
		body: body,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	};
	var response = await fetch(url, init);
	var json = await response.json();
	return json.access_token;
}
// function DriveItemsHtml(json, pathdomain) {
// 	var html = Htmlbody(`
//     <div class="header bg-blue-500 text-white py-4">
//     <h1 class="text-3xl font-semibold text-center">Drive Items</h1>
// </div>
// <div class=" grid gap-4 grid-cols-1  lg:grid-cols-3 m-2">
//     ${(function () {
// 			let generatedHtml = '';
// 			for (let i = 0; i < json.value.length; i++) {
// 				const item = json.value[i];
// 				generatedHtml += `
//                 <div class="drive-item bg-white p-4 rounded-md shadow-md text-blue-400">
//                   <div class="flex items-center mb-2 overflow-hidden">
//     <i class="${item.folder ? 'fas fa-folder text-blue-500' : 'fas fa-file text-gray-500'} text-2xl mr-2"></i>
//     ${
// 			item.folder
// 				? `<a href="/bypath?id=${item.id}" class="text-lg font-semibold text-blue-500 hover:underline">${item.name}</a>`
// 				: `<a href="/download?id=${item.id}" class="text-lg font-semibold text-gray-500 hover:underline">${item.name}</a>`
// 		}
// </div>

//                    <p class="text-gray-600">
//     ${
// 			item.size
// 				? item.size >= 1024 * 1024 * 1024
// 					? (item.size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
// 					: (item.size / 1024 / 1024).toFixed(2) + ' MB'
// 				: 'N/A'
// 		}
// </p>

//                     ${
// 											item.folder
// 												? ``
// 												: `
// <div class="flex flex-row items-center gap-2">
//     <a href="/download?id=${item.id}" class="inline-block text-center border rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//         <i class="fas fa-download"></i> Download
//     </a>
// 	<a href="${item.webUrl}" class="inline-block text-center border rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600">
//         <i class="fa-solid fa-eye"></i> WebView
//     </a>
//     <button class="inline-block text-center border rounded-md px-4 py-2 bg-blue-500 text-white hover:bg-blue-600" onclick="copyLink('${pathdomain}/download/?id=${item.id}')">
//         <i class="fas fa-copy"></i> Copy URL
//     </button>
// </div>

// `
// 										}
//                 </div>
//             `;
// 			}
// 			return generatedHtml;
// 		})()}
// </div>
// <script>
//     function copyLink(link) {
//         navigator.clipboard.writeText(link);
//     }
// </script>

//     </script>
// `);
// 	return html;
// }

// function Htmlbody(innerhtml) {
// 	var html = `
// 	<!DOCTYPE html>
// <html>
// <head>
//   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
//    <script src="https://cdn.tailwindcss.com"></script>
// 	<title>OneDrive</title>
// 	<link rel="icon" href="https://www.onedrive.com/favicon.ico" type="image/x-icon">
// 	<meta name="viewport" content="width=device-width, initial-scale=1.0">

// 	</head>
//   <style>
// 	body {
// 		font-family: Arial, sans-serif;
// 		background-color: #f5f5f5;
// 		margin: 0;
// 		padding: 0;
// 				}
// 	  </style>

// 	<body>
// 	<nav class="bg-blue-500 py-4">
//     <div class="container mx-auto">
//         <div class="flex justify-between items-center">
//             <a href="/" class="text-white hover:underline">
//                 <div class="text-white font-semibold text-lg">Home</div>
//             </a>
//             <div class="flex  ">
//                 <form class="flex gap-2">
//                     <input type="text" name="search" placeholder="Search" class="border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 px-2 py-1">
//                     <button type="submit" class="bg-blue-200 text-gray-900 rounded-md hover:bg-blue-100 focus:outline-none px-4 py-2">Search</button>
//                 </form>
//             </div>
//         </div>
//     </div>
// </nav>

// 	${innerhtml}
// 	</body>
// </html>`;
// 	return html;
// }
