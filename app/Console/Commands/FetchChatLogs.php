<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\ChatLog;
use Carbon\Carbon;

class FetchChatLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-chat-logs';

    private $configSettings;
    private $platformId;
    private $chatApiUrl;


    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch AI Search Logs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        //
        $this->configSettings = config('app'); //
        // dd($this->configSettings);
        $this->platformId = $this->configSettings['platform_settings']['platform_id'];
        $this->chatApiUrl = $this->configSettings['platform_settings']['chat_api_url'];
        $this->info('starting fetch request');
        return $this->chatLogs($this->platformId);
    }

    private function chatLogs($id)
    {

        $platformId = $this->platformId;
        $chatApiUrl = $this->chatApiUrl;

        $response = Http::get("{$chatApiUrl}/{$platformId}");
        // dd($response->successful());

        //check if count from the database matches count from chatapi
        $dbCount = ChatLog::count();
        // dd($chatApiUrl);


        // dd(collect($response->json())->count());
        try {
            //Process the data
            if ($response->successful()) {

                $data = collect($response->json());
                $apiCount = $data->count();

                //check if count from the database matches count from chatapi   
                if (($dbCount != $apiCount) && ($apiCount > 0)) {
                    foreach ($data as $item) {
                        // dd(Carbon::parse($item['created_at']));
                        ChatLog::updateOrCreate(
                            // Lookup condition (use non-primary key)
                            ['search_id' => $item['id']],

                            // Values to update or insert
                            [
                                'session_id' => $item['user_id'],
                                'user_id' => 2,
                                'message' => $item['message'],
                                'remote_ip' => $item['remote_ip'],
                                'search_date' => Carbon::parse($item['created_at']),
                                'published' => 1,
                            ]
                        );
                    }


                }

            } else {
                // Handle API error
                $statusCode = $response->status();
                $errorMessage = $response->body();
                return back()->withErrors("API Error: {$statusCode} - {$errorMessage}");
            }
        } catch (\Exception $e) {
            // Handle network or other exceptions
            return back()->withErrors("An error occurred: " . $e->getMessage());
        }

        $this->info('finishing data fetch');
    }
}
