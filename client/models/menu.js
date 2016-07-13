import fetch from 'isomorphic-fetch';

export function generateNewGame(accessCode) {
  return fetch('/api/games', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }, 
    body: JSON.stringify({
      accessCode: accessCode
    })
  })
    .then(gameId => gameId.json());
}

export function getGames() {
  return fetch('/api/games', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    } 
  })
    .then(data => {
      console.log(data)
      return data.json()
    });
}
