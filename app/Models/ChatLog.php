<?php

namespace App\Models;

use A17\Twill\Models\Behaviors\HasBlocks;
use A17\Twill\Models\Behaviors\HasRevisions;
use A17\Twill\Models\Behaviors\HasPosition;
use A17\Twill\Models\Behaviors\Sortable;
use A17\Twill\Models\Model;

class ChatLog extends Model implements Sortable
{
    use HasBlocks, HasRevisions, HasPosition;

    protected $fillable = [
        'search_id',
        'session_id',
        'user_id',
        'message',
        'remote_ip',
        'search_date',
    ];

    
}
