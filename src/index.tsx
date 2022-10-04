import React from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@unfocused/nurvus-ui';
import Spawn from '@unfocused/spawn';
import Data from './data/data.json';
import API from './server/constants';
import './index.scss';

const { URL, PORT } = API;

function fetchIt() {
  fetch(`http://${URL}:${PORT}/test`)
  .then(res => {
    return res.text();
  })
  .then(res => console.log(res))
  .catch((error) => {
    console.error('Error: Is your API offline?', error);
  });
}

const App = () => {
  return (
    <div>
      <Button onClick={ fetchIt }>Your build is successful.</Button>
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.body.appendChild(Spawn({
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  }))
);
