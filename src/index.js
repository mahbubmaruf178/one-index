import { DriveItemsHtml } from './html.js';
const client_id = '0a2991a3-1674-4334-8561-671cc7349960';
const client_secret = 'uw67Q~TCMqdJyH35hlcHHclv~mhNOGx.jfPFm';
const redirect_uri = 'https://alist.nn.ci/tool/onedrive/callback';
const refresh_token = ' Your Refresh Token';
const token_url = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

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
