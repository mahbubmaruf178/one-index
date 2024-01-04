# OneIndex
![Image](<https://github.com/mahbubmaruf178/one-index/blob/master/public/list.png?raw=true>)
This project allows you to create an index for your OneDrive,Gdrive,Pcloud.. etc files using Cloudflare Workers. With this index, you can download files using Cloudflare's reverse proxy, open files with an Android app, and enjoy resume download support.

## Installation

##  How to deploy a site with GitHub 
* Fork this repository to your GitHub account.
* Edit index.config.ts file. 
* Replace the refresh token.You Will get refresh token from [here](https://alist.nn.ci/tool/onedrive/request.html).
* Set up a new project on Cloudflare Pages.
* Log in to the Cloudflare dashboard and select your account in Account Home > Pages.
* Select Create a new Project and the Connect Git option.
* Select the git project you want to deploy and click Begin setup
* Use the following build settings:
* Framework preset: Astro
* Build command: npm run build
* Build output directory: dist
* Click the Save and Deploy button.


## Features

- Download files with Cloudflare reverse proxy.
- Open files with an Android app.
- Resume download supported.
- multi drive supported.


## Upcoming Features
We have some exciting features in the pipeline:
1. Search for files.
2. Admin authentication for added security and control.

## Screenshots
![Image](<https://github.com/mahbubmaruf178/one-index/blob/master/public/ss1.png?raw=true>)
![Image](<https://github.com/mahbubmaruf178/one-index/blob/master/public/ss2.png?raw=true>)

## Contributing

Contributions are welcome! Feel free to open issues and pull requests to help improve this project.

## License

This project is licensed under the [MIT License](LICENSE).

---

**Disclaimer:** This project is not affiliated with Microsoft or OneDrive. Please use it responsibly and in compliance with the terms of service of the services you are using.