<?php

namespace App\Helpers;

use A17\Twill\Facades\TwillNavigation;
use A17\Twill\View\Components\Navigation\NavigationGroup;
use A17\Twill\View\Components\Navigation\NavigationLink;

class AdminMenu
{
    public static function register(): void
    {
        // TwillNavigation::addLink(
        //     NavigationLink::make()->forDashboard()
        // );

        TwillNavigation::addLink(
            NavigationLink::make()->forModule('platformMessages')
        );

        TwillNavigation::addLink(
            NavigationLink::make()
                ->forModule('domainExperiences')
                ->title('Domain Field') //
        );

        TwillNavigation::addLink(
            NavigationLink::make()
                ->forModule('skillLevels')
                ->title('Skill Levels') //
        );

        TwillNavigation::addLink(
            NavigationLink::make()
                ->forModule('learninGoals')
                ->title('Learning Goals') //
        );

        TwillNavigation::addLink(
            NavigationLink::make()
                ->forModule('interests')
                ->title('Topics of Interests') //
        );

        TwillNavigation::addLink(
            NavigationLink::make()
                ->forModule('courses')
                ->title('Courses') //
        );

        TwillNavigation::addLink(
            NavigationLink::make()
                ->forModule('chatLogs')
                ->title('AI Searches') //
        );

        // Example: Add a group with links
        // TwillNavigation::addGroup(
        //     NavigationGroup::make('Content')
        //         ->addLink(NavigationLink::make()->forModule('posts'))
        //         ->addLink(NavigationLink::make()->forModule('projects'))
        // );
    }
}

