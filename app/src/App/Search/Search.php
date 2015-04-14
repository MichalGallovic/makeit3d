<?php namespace App\Search;

use Model;

class Search {
    public function models($search) {
        return Model::search($search)->get()->take(4);
    }
}