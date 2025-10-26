<?php
namespace App\Service;

use voku\helper\StopWords;

class StopWordService
{
    protected StopWords $stopWords;

    public function __construct(string $language = 'en')
    {
        $this->stopWords = new StopWords();
        $this->language = $language;
    }

    //This will help us remove stop words and retain key words
    public function removeStopWords(string $text): string
    {
        $words = preg_split('/\s+/', strtolower($text));
        $stopWordsList = $this->stopWords->getStopWordsFromLanguage($this->language);

        $filtered = array_filter($words, function ($word) use ($stopWordsList) {
            return !in_array($word, $stopWordsList);
        });

        return implode(' ', $filtered);
    }
}
