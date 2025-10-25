<?php

use A17\Twill\Facades\TwillRoutes;

// Register Twill routes here eg.
// TwillRoutes::module('posts');

TwillRoutes::module('platformMessages');
TwillRoutes::module('platformUserMessages');
// TwillRoutes::module('sectors');
// TwillRoutes::module('sectors');
TwillRoutes::module('domainExperiences');
TwillRoutes::module('skillLevels');
TwillRoutes::module('learninGoals');
TwillRoutes::module('interests');
TwillRoutes::module('courses');

Route::post('/coursesMetaData/updates/{id}', 'CourseController@coursesMetaDataUpdate')->name('coursesMetaDataUpdate');
TwillRoutes::module('chatLogs');