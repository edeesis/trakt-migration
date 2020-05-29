import React, {useState} from 'react';
import './App.css';

const shows = []

function App() {
  const clientId = localStorage.getItem("CLIENT_ID");
  const clientSecret = localStorage.getItem("CLIENT_SECRET");
  const code = new URLSearchParams(window.location.search).get("code");

  const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [userId, setUserId] = useState(undefined);

  function getAccessToken() {
    const url = "https://api.trakt.tv/oauth/token"
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: "http://localhost:3000",
        grant_type: "authorization_code"
      })
    }).then(response => response.json())
      .then(data => {
          const accessToken = data["access_token"];
          localStorage.setItem("ACCESS_TOKEN", accessToken);
          setToken(accessToken)
          fetchUser();
        }
      );
  }

  function fetchUser() {
    const url = "https://api.trakt.tv/users/me"
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "trakt-api-key": clientId,
        "trakt-api-version": 2,
        "Authorization": "Bearer " + token
      }}).then(response => response.json())
      .then(data => {
          setUserId(data["ids"]["slug"]);
        }
      );
  }

  const [listName, setListName] = useState(undefined);
  const [listId, setListId] = useState(undefined);

  function handleListNameChange(event) {
    setListName(event.target.value)
  }

  function fetchList() {
    const url = "https://api.trakt.tv/users/" + userId + "/lists"
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "trakt-api-key": clientId,
        "trakt-api-version": 2,
        "Authorization": "Bearer " + token
      }
    }).then(response => response.json())
      .then(data =>
        setListId(data.filter(list => list["name"] === listName)[0]["ids"]["trakt"])
      );
  }

  const [choice, setChoice] = useState("");
  const [results, setResults] = useState([]);

  function executeSearch(search) {
    const url = "https://api.trakt.tv/search/show?query=" + encodeURIComponent(search)
    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "trakt-api-key": clientId,
        "trakt-api-version": 2,
        "Authorization": "Bearer " + token
      }
    }).then(response => response.json())
      .then(data => {
        const results = data.map(show => {
          return {
            id: show["show"]["ids"]["trakt"],
            name: show["show"]["title"]
          }
        });
        setChoice(results[0]["id"])
        setResults(results)
      });
  }

  const [index, setIndex] = useState(0);

  function changeSelectChange(event) {
    setChoice(event.target.value)
  }

  function addToList() {
    const url = "https://api.trakt.tv/users/"  + userId + " /lists/" + listId + "/items"
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "trakt-api-key": clientId,
        "trakt-api-version": 2,
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        shows: [
          {
            ids: {
              trakt: choice
            }
          }
        ]
      })
    }).then(response => response.json())
      .then(data => console.log(data))
  }

  function nextSearch() {
    executeSearch(shows[index])
    setIndex(index + 1)
  }

  function submitAndExecuteNextSearch() {
    addToList()
      .then(() => nextSearch())
  }

  const loginUrl = "https://api.trakt.tv/oauth/authorize?response_type=code&client_id=" + clientId + "&redirect_uri=http://localhost:3000&state=randomstate"

  return (
    <div className="App">
      <h3>Add stuff to Trakt Lists</h3>
      {
        (!code && !token) ? <a href={loginUrl}>Login</a> :
          <>
            {
              token && userId ? <h4>Token Retrieved for user {userId}</h4> : <button type="button" onClick={getAccessToken}>Get Access Token</button>
            }
            <br/>
            <input type="text" placeholder="List Name to Search" onChange={handleListNameChange} />
            <button type="button" onClick={fetchList}>Fetch List</button>
            {
              listId && <h4>List ID is: {listId}</h4>
            }
            <br/>
            <button type="button" onClick={nextSearch}>Submit Search</button>
            <br />
            <select value={choice} onChange={changeSelectChange}>
              {
                results.map(obj => <option key={obj.id} value={obj.id}>{obj.name}</option>)
              }
            </select>
            <br/>
            <button type="button" onClick={submitAndExecuteNextSearch}>Confirm Choice and Search Next</button>
            <br/>
            <button type="button" onClick={addToList}>Add to List</button>
            <br/>
          </>
      }
    </div>
  );
}

export default App;
