import { DriveItemsHtml } from './html.js';

const client_id = 'dd8b4a2e-5bad-4256-b0f9-c360b51fde67';
const client_secret = 'iZh8Q~oYe1jKZ~UbIXAUqDTx1tuYzNQBY706Eces';
const refresh_token =
	'0.AUoAJGMhXWgu7E-pXfpN7WNVxi5Ki92tW1ZCsPnDYLUf3meJAJY.AgABAAEAAAAtyolDObpQQ5VtlI4uGjEPAgDs_wUA9P9rUh37aKk1NkUeDx8aUP6q9q01knM70XGMg4ya-kmNQwLrBhWG3sHLItwJDDGBNmOLRB7sUgJAp6GiTiQmXcy0l6CULwkMD4Tm8GyghD6EhZhWiqwb2ylvMP9AhdQwLPjUi05Chrpr6m9J8qqyQnZprs-hzl8HoG7fLPPXcqAkmdINE7X7n-M5wiQeYG5OgM3FvGRoLV3LZ2jh9V5MRrgANJcJEM31nNhQYirfG4DQ4kGfPfgke5Ix-fsqijTpctGamt1TnHyy74qPAyru3HFXZdvGqy1qGWBdFosSRhO578YLBViMtByCFQwWmXV2zGDBXDif1SQLMRa4rP_LGJ_DVdaUTQpvuU3vlgZ-Ho7ne8ifKRgbsdxOxfztfnA--dvV4eHGUPAQiTa2HkszHuX8niU3x54l04dZGzkMXonXMQ9aeS2KMOPaO-iae31e0mqoahKD-Kffd0xDTQ1_Y6Nt17Bc5K3oshhepcf9tE-Bn_HfTdOTo-CBzdKfRxAMKQf_YEnujB09-JUIN7j8-7ht3JZgs4tgjfohGebyuTTR6kdcs2heijsT93AvhMnZ_XQ2JDGxiflMnXJ3D_FANTRHGAMIeiZM896RaHGiABebmXbU1J81D8wye3RPcJJFY3lpjCY0vox2EM4CRpklJliDUqMMiJ7GHB859_WEKr94GTSkJQRgavvRUS-bGTBhPVezvW62UDWCpqXnr8HCECdQZGCJS1qV2e5ucBV0_zaGTFPabn6caurejHNwryv8AUnGrZSrPRAUcgGrIcRvXlhY';

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
