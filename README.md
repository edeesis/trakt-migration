Simple React App to that I wrote to save myself a bunch of clicks in the Trakt UI and to save my hand from pain.

It probably took way longer to write this than it would've taken me to do it manually.

It's not pretty, but it works pretty well. (Disclaimer: it worked when I did it before I changed a bunch of stuff and haven't tested since).

### Initial Setup

Create an app on the trakt website and insert your client id and client secret into localStorage.

Since this uses fetch, you're going to have to add localhost:3000 to the cors policy on the app.

The redirect URI is also hard coded to localhost:3000 in this app, so that should be reflected in the app settings on trakt.tv. 

### Start up

Run `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.