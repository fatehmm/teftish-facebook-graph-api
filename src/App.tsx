import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
	const [count, setCount] = useState<string>("");
	const [status, setStatus] = useState<string | undefined>("Initial");
	const [userID, setUserID] = useState<string | undefined>();
	const [pageID, setPageID] = useState<string | undefined>();
	const [accessToken, setAccessToken] = useState<string | undefined>();
	const [pageAccessToken, setPageAccessToken] = useState<
		string | undefined
	>();
	const [pageData, setPageData] = useState<any>();
	const [message, setMessage] = useState<string | undefined>();
	useEffect(() => {
		FB.getLoginStatus(function (response) {
			if (response.status === "connected") {
				// the user is logged in and has authenticated your
				// app, and response.authResponse supplies
				// the user's ID, a valid access token, a signed
				// request, and the time the access token
				// and signed request each expire
				var uid = response.authResponse.userID;
				const scopes = response.authResponse.grantedScopes;
				//@ts-ignore
				setCount(scopes);
				setStatus("Connected to the app; Logged in into Facebook");
				console.log(response.authResponse);

				setUserID(response.authResponse.userID);
				setAccessToken(response.authResponse.accessToken);
				getPageID();
			} else if (response.status === "not_authorized") {
				setStatus("Not connected to the app; Logged in into Facebook");

				// the user is logged in to Facebook,
				// but has not authenticated your app
			} else {
				setStatus("Not logged in into Facebook");

				// the user isn't logged in to Facebook.
			}
		});
	}, []);

	function getPageID(): string | undefined {
		axios
			.get(
				`https://graph.facebook.com/v19.0/${userID}/accounts?access_token=${accessToken}`
			)
			.then((response: { data: { id: any } }) => {
				// console.log(response);
				// @ts-ignore
				setPageData(response.data["data"][0]);
				console.log("page data ", pageData);
				console.log("Page ID:", response.data.id);
				setPageAccessToken(pageData.access_token);
				setPageID(pageData.id);
				return response.data.id;
			})
			.catch((error: any) => {
				console.error("Error fetching page ID:", error);
			});

		return undefined;
	}

	async function sendMessage() {
		const response = await fetch(
			`https://graph.facebook.com/v19.0/${pageID}/feed`,
			{
				headers: {
					"Content-type": "application/json",
				},
				body: JSON.stringify({
					message: message,
					access_token: pageAccessToken,
				}),
				method: "POST",
			}
		);
		if (!response.ok) {
			console.error("There is a problem with posting the message");
		}
	}

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img
						src={reactLogo}
						className="logo react"
						alt="React logo"
					/>
				</a>
			</div>
			<h1>Teftish Content API</h1>
			<div className="card">
				<button
					onClick={() => {
						FB.ui({
							method: "share",
							href: "https://developers.facebook.com/docs/",
						});
					}}
				>
					Share
				</button>

				<button
					onClick={() => {
						FB.api(
							"/me/accounts",
							"get",
							{
								"access-token": count.toString(),
							},
							function (response) {
								console.log(response);
							}
						);
					}}
				>
					Me
				</button>

				<button onClick={getPageID}>Get Page ID</button>

				<button
					onClick={() => {
						FB.login(function (response) {
							if (response.authResponse) {
								console.log(
									"Welcome!  Fetching your information.... "
								);
								//@ts-ignore
								FB.api("/me", function (response) {
									console.log(
										"Good to see you, " +
											//@ts-ignore
											response.name +
											"."
									);
									console.log(response);
								});
							} else {
								console.log(
									"User cancelled login or did not fully authorize."
								);
							}
						});
					}}
				>
					Login
				</button>

				<button
					onClick={() => {
						FB.logout(function (response) {
							console.log(response);
						});
					}}
				>
					Log out
				</button>

				<input
					style={{
						width: "200px",
						height: "32px",
						borderRadius: "8px",
					}}
					type="text"
					placeholder="write here to post message to the page"
					onChange={(e) => {
						setMessage(e.target.value);
					}}
				/>
				<button
					onClick={() => {
						sendMessage();
					}}
				>
					Send
				</button>

				<p>User ID: {userID}</p>

				<p>Access Token: {accessToken}</p>

				{/* <ReactJson src={pageData} /> */}
				<pre>Page data: {JSON.stringify(pageData, null, 2)}</pre>
			</div>
			<p className="read-the-docs">{status}</p>
		</>
	);
}

export default App;
