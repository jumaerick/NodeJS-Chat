<?php

namespace App\Models;
use App\Models\DomainExperience;
use App\Models\SkillLevel;
use App\Models\Interest;
use App\Models\LearninGoal;
use App\Models\UserMetaData;
use App\Models\ChatLog;

use A17\Twill\Models\User as TwillBaseUser;

class User extends TwillBaseUser
{
    protected $table = 'twill_users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'domain_field_id',
        'skill_level_id',
        'learning_goal_id',
        'interest_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'google_token_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

       //
    public function domainFields()
    {
        // dd(DomainExperience::all());
        // return $this->belongsToMany(DomainExperience::class);
        return $this->belongsToMany(DomainExperience::class, 'users_metadata'); // pivot table name
    }

    public function skillLevelFields()
    {
        // dd(DomainExperience::all());
        // return $this->belongsToMany(DomainExperience::class);
        return $this->belongsToMany(SkillLevel::class, 'users_metadata'); // pivot table name
    }

    public function interestFields()
    {
        // dd(DomainExperience::all());
        // return $this->belongsToMany(DomainExperience::class);
        return $this->belongsToMany(Interest::class, 'users_metadata'); // pivot table name
    }

    public function learningGoalFields()
    {
        // dd(DomainExperience::all());
        // return $this->belongsToMany(DomainExperience::class);
        return $this->belongsToMany(LearninGoal::class, 'users_metadata'); // pivot table name
    }


    public function userMetaData(){
        return $this->hasMany(UserMetaData::class);
    }

    public function chatSearches(){
        // dd(ChatLog::take(5)->get());
        return $this->hasMany(ChatLog::class, 'user_id');
    }

}

