<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Service\RecommendationEngine;
use Illuminate\Support\Facades\Http;
use Illuminate\Pagination\LengthAwarePaginator;

use Auth;

class HomeController extends Controller
{

    private $configSettings;
    private $platformId;
    private $chatApiUrl;
    private $perPage;

    public function __construct()
    {
        $this->configSettings = config('app'); //
        // dd($this->configSettings);
        $this->platformId = $this->configSettings['platform_settings']['platform_id'];
        $this->chatApiUrl = $this->configSettings['platform_settings']['chat_api_url'];
        $this->perPage = 10;
        // dd($this->chatApiUrl);
    }

    public function home(){
        return view('welcome');
    }

    public function recommendation(RecommendationEngine $engine){
        $user =Auth::user();
        
        //Get recommendations
        $recommendations = $engine->recommendCourses($user);
        return view('recommendations', compact('recommendations'));
    }

    public function akiChatLogs($id){

        $perPage = $this->perPage;
        $currentPage = request()->get('page', 1);
        $platformId = $this->platformId;
        $chatApiUrl = $this->chatApiUrl;

        $response = Http::get("{$chatApiUrl}/{$platformId}");
        // dd($response->successful());
        try {
            //Process the data
            if($response->successful()){
                
                $data = collect($response->json());
                // dd($data);
                        // Slice the collection for the current page
                $currentItems = $data->slice(($currentPage - 1) * $perPage, $perPage)->values();

                // Create paginator
                $paginatedData = new LengthAwarePaginator(
                    $currentItems,
                    $data->count(), // total items
                    $perPage,
                    $currentPage,
                    ['path' => request()->url(), 'query' => request()->query()]
                );
                return view('chatLogs', compact('paginatedData'));
            }
            else{
                // Handle API error
                $statusCode = $response->status();
                $errorMessage = $response->body();
                return back()->withErrors("API Error: {$statusCode} - {$errorMessage}");
            }
        }
        catch (\Exception $e) {
                // Handle network or other exceptions
                return back()->withErrors("An error occurred: " . $e->getMessage());
        }
    }
}
