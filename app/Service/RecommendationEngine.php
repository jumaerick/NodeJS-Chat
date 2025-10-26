<?php 

namespace App\Service;

use App\Models\Course;
use App\Service\StopWordService;
use Illuminate\Support\Str;

class RecommendationEngine
{

    // protected $stopWordService;

    public function __construct(StopWordService $stopWordService)
    {
        $this->stopWordService = $stopWordService;
    }


    public function recommendCourses($user)
    {
        //Fetch all the AI search terms of the user
        $searchTerms = $user->chatSearches->pluck('message');
        // dd($chatLogs);
        
        $courses = Course::with(['domainFields', 'skillLevelFields', 'interestFields', 'learningGoalFields'])->get();
        $recommendations = [];
        $score = 0;
        $reasons = [];
        foreach ($courses as $course) {
// dd($user->interestFields);
            // Domain overlap
            $sharedDomains = $course->domainFields->pluck('id')->intersect($user->domainFields->pluck('id'));
            if ($sharedDomains->isNotEmpty()) {
                $score += $sharedDomains->count() * 2; // domains are important
                $reasons[] = 'similar domain(s)';
            }

            // Interest overlap
            $sharedInterests = $course->interestFields->pluck('id')->intersect($user->interestFields->pluck('id'));
            if ($sharedInterests->isNotEmpty()) {
                $score += $sharedInterests->count() * 1.5;
                $reasons[] = 'matches your interest';
            }

            // Learning goal overlap
            $sharedGoals = $course->learningGoalFields->pluck('id')->intersect($user->learningGoalFields->pluck('id'));
            if ($sharedGoals->isNotEmpty()) {
                $score += $sharedGoals->count();
                $reasons[] = 'fits your learning goals';
            }

            //Skill level (assuming single)
            $sharedSkills = $course->skillLevelFields->pluck('id')->intersect($user->skillLevelFields->pluck('id'));
            if ($sharedSkills->isNotEmpty()) {
                $score += $sharedSkills->count();
                $reasons[] = 'fits your skill levels';
            }

            if ($score > 0) {
                $recommendations[] = [
                    'course' => $course,
                    'score' => $score,
                    'reasons' => implode(', ', $reasons),
                ];
            }
        }

        //Lets also add compute the score of individual searches
        foreach($searchTerms as $term) {
            $converted = collect(explode(' ', $this->stopWordService->removeStopWords(Str::lower($term))));
            
            dd($converted);
        }
        // Sort by score descending

        usort($recommendations, fn($a, $b) => $b['score'] <=> $a['score']);
        // Filter out recommendations with less than 2 reasons
        $recommendations = array_filter($recommendations, function($recommendation) {
            return count(explode(',', $recommendation['reasons'])) >= 2;
        });

        // dd($recommendations);
        return $recommendations;
    }
}