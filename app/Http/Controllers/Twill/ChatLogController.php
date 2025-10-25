<?php

namespace App\Http\Controllers\Twill;

use A17\Twill\Models\Contracts\TwillModelContract;
use A17\Twill\Services\Listings\Columns\Text;
use A17\Twill\Services\Listings\TableColumns;
use A17\Twill\Services\Forms\Fields\Input;
use A17\Twill\Services\Forms\Form;
use A17\Twill\Http\Controllers\Admin\ModuleController as BaseModuleController;

class ChatLogController extends BaseModuleController
{
    protected $moduleName = 'chatLogs';

    protected $keyColumn='user_id';

        // 🧹 Disable Twill’s default columns
    protected $defaultIndexColumns = [];

        protected $defaultIndexOptions = [
        'create' => false,
        'edit' => false,
        'publish' => false,
        'bulkPublish' => false,
        'feature' => false,
        'bulkFeature' => false,
        'restore' => false,
        'bulkRestore' => false,
        'forceDelete' => false,
        'bulkForceDelete' => false,
        'delete' => false,
        'duplicate' => false,
        'bulkDelete' => false,
        'reorder' => false,
        'permalink' => true,
        'bulkEdit' => true,
        'editInModal' => false,
        'skipCreateModal' => false,
        'includeScheduledInList' => true,
        'showImage' => false,
        'sortable' => true,
    ];
    protected $indexColumns = [
            'user_id' => [
                'title' => 'Search ID',
                'field' => 'user_id',
            ],
            // 'session_id' => [
            //     'title' => 'User',
            //     'field' => 'session_id',
            //     'visible' => false,  // you can toggle visibility
            // ],

                'remote_ip' => [
                'title' => 'Remote Ip',
                'field' => 'remote_ip',
                'visible' => false,  // you can toggle visibility
            ],

            'message' => [
                'title' => 'Message',
                'field' => 'message',
                'visible' => true,  // you can toggle visibility

            ],
            'search_date' => [
                'title' => 'Search Date',
                'field' => 'search_date',
                'visible' => true,  // you can toggle visibility
            ],
        ];
    /**
     * This method can be used to enable/disable defaults. See setUpController in the docs for available options.
     */
    protected function setUpController(): void
    {
        $this->disablePermalink();
    }

    /**
     * See the table builder docs for more information. If you remove this method you can use the blade files.
     * When using twill:module:make you can specify --bladeForm to use a blade form instead.
     */
    // public function getForm(TwillModelContract $model): Form
    // {
    //     $form = parent::getForm($model);

    //     $form->add(
    //         Input::make()->name('description')->label('Description')
    //     );

    //     return $form;
    // }

    /**
     * This is an example and can be removed if no modifications are needed to the table.
     */
    protected function additionalIndexTableColumns(): TableColumns
    {
        $table = parent::additionalIndexTableColumns();

        // $table->add(
        //     Text::make()->field('description')->title('Description')
        // );

        return $table;
    }
}
