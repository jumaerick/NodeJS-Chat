<?php

namespace App\Repositories;

use A17\Twill\Repositories\Behaviors\HandleBlocks;
use A17\Twill\Repositories\Behaviors\HandleRevisions;
use A17\Twill\Repositories\ModuleRepository;
use App\Models\ChatLog;
use Illuminate\Database\Eloquent\Builder;

class ChatLogRepository extends ModuleRepository
{
    use HandleBlocks, HandleRevisions;

    public function __construct(ChatLog $model)
    {
        $this->model = $model;
    }

       public function filter(Builder $query, array $scopes = []): Builder
    {
        dd(request()->filter);
        if(isset($scopes['search'])){
        dd($scopes);
        }
        // if (TwillPermissions::enabled()) {
        //     $query->where('is_superadmin', '<>', true);
        // } else {
        //     $query->where('role', '<>', 'SUPERADMIN');
        // }
        return parent::filter($query, $scopes);
    }
}
