# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of the URL Edit page"](https://github.com/wfhopkins/tinyAppProject/blob/main/docs/edit-urls-page.png?raw=true)

!["Screenshot of the Registration page"](https://github.com/wfhopkins/tinyAppProject/blob/main/docs/register-page.png?raw=true)

!["Screenshot of the URLs page"](https://github.com/wfhopkins/tinyAppProject/blob/main/docs/urls-page.png?raw=true)


## Dev Notes
Expecting Rejection:
The current version of the app has an issue with the registraion. Users are unable to log back in after logging out.
It had been working for most of the day but was a functionality i hadn't thought to test with each change. I am unsure when
I removed the functioanlity and will need help finding the issue. It appears that the user is not being stored in the user database upon registering.

I am submitting the project as is because I would rather have it rejected and be able to fix it with feedback than to continue trying
to solve this by myself.

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- cookie-parser

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
