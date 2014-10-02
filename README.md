cs467-email-visualization
=========================

D3.js based email visualization for CS467

Our project uses the 'imap' node package to fetch email data.  In order to install imap, use: `npm install imap` in your terminal.

In order to maintain some security, you can authenticate the app by making a file called "secret.js" in the main directory.

The contents of secret.js should be as follows:
<pre>
module.exports = {
	user: 'myname@gmail.com',
	password: 'mysupersecret',
	aliases: ['myname@gmail.com', 'myothername@gmail.com', 'etc@gmail.com']
}
</pre>

Finally, you can run the Node app by typing `node app` into your terminal at the main directory.
