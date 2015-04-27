<?php
use Illuminate\Database\Eloquent\Collection;

class Order extends \Eloquent {
	protected $fillable = [];

    public function user() {
        return $this->belongsTo('User');
    }

    public function models() {
//        $models_ids = $this->model
        $models = json_decode($this->models);

        if(!isset($models->data))
            return null;
        if(empty($models->data))
            return null;

        // remove possible empty strings
        $models->data = array_filter($models->data);
        $data = new Collection();

        foreach($models->data as $model_id) {
            $model = Model::find($model_id);
            if($model) {
                $data->push($model);
            }
        }
        return $data;
    }

}