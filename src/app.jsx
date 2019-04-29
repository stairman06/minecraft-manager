import React from 'react';

import { HashRouter as Router, Route } from 'react-router-dom';
import HomePage from './page/home/homePage';
import ViewProfilePage from './page/viewprofile/viewprofile';
import EditPageGeneral from './page/editprofile/general/editpagegeneral';
import EditPageVersions from './page/editprofile/versions/editpageversions';

const App = () => (
    <div>
        <Router>
            <div>
                <Route exact path='/' component={HomePage} />
                <Route path='/profile/:id' component={ViewProfilePage} />
                <Route path='/edit/general/:id' component={EditPageGeneral} />
                <Route path='/edit/versions/:id' component={EditPageVersions} />
            </div>
        </Router>
    </div>
);

export default App;