# Dapr JavaScript SDK documentation

This page covers how the documentation is structured for the Dapr JavaScript SDK

## Dapr Docs

All Dapr documentation is hosted at [docs.dapr.io](https://docs.dapr.io), including the docs for the [JavaScript SDK](https://docs.dapr.io/developing-applications/sdks/javascript/). Head over there if you want to read the docs.

### JavaScript SDK docs source 

Although the docs site code and content is in the [docs repo](https://github.com/dapr/docs), the JavaScript SDK content and images are within the `content` and `static` directories, respectively. 

This allows separation of roles and expertise between maintainers, and makes it easy to find the docs files you are looking for.

## Writing JavaScript SDK docs

To get up and running to write JavaScript SDK docs, visit the [docs repo](https://github.com/dapr/docs) to initialize your environment. It will clone both the docs repo and this repo, so you can make changes and see it rendered within the site instantly, as well as commit and PR into this repo.

Make sure to read the [docs contributing guide](https://docs.dapr.io/contributing/contributing-docs/) for information on style/semantics/etc.

## Docs architecture

The docs site is built on [Hugo](https://gohugo.io), which lives in the docs repo. This repo is setup as a git submodule so that when the repo is cloned and initialized, the javascript-sdk repo, along with the docs, are cloned as well.

Then, in the Hugo configuration file, the `daprdocs/content` and `daprdocs/static` directories are redirected to the `daprdocs/developing-applications/sdks/javascript` and `static/javascript` directories, respectively. Thus, all the content within this repo is folded into the main docs site.