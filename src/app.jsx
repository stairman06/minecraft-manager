import React from 'react';

import { HashRouter as Router, Route } from 'react-router-dom';
import HomePage from './page/home/homePage';
import ViewProfilePage from './page/viewprofile/viewprofile';
import EditPageGeneral from './page/editprofile/general/editpagegeneral';
import EditPageVersions from './page/editprofile/versions/editpageversions';
import EditPageMods from './page/editprofile/mods/editpagemods';
import EditPageAdvanced from './page/editprofile/advanced/editpageadvanced';
const App = () => (
    <div>
        <Router>
            <div>
                <Route exact path='/' component={HomePage} />
                <Route path='/profile/:id' component={ViewProfilePage} />
                <Route path='/edit/general/:id' component={EditPageGeneral} />
                <Route path='/edit/versions/:id' component={EditPageVersions} />
                <Route path='/edit/mods/:id' component={EditPageMods} />
                <Route path='/edit/advanced/:id' component={EditPageAdvanced} />
            </div>
        </Router>
    </div>
);

export default App;