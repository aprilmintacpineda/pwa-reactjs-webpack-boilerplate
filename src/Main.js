/** @format */

import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';

import Home from 'routes/Home';
import TestForm from 'routes/TestForm';

function Main () {
  console.log('process.env', process.env);
  console.log('process.env.array', process.env.array);
  console.log('process.env.object', process.env.object);
  console.log('process.env.api_url', process.env.api_url);
  console.log('process.env.bool', process.env.bool);
  console.log('process.env.num', process.env.num);

  return (
    <BrowserRouter>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/test-form">Test form</Link>
        </li>
      </ul>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/test-form" component={TestForm} />
      </Switch>
    </BrowserRouter>
  );
}

export default React.memo(Main);
