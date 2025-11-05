<?php

use Bluehost\AutoIncrement;

require_once __DIR__ . '/../AutoIncrement.php';

global $wpdb;

( new AutoIncrement( $wpdb ) )
	->fix_auto_increment( 'options', 'option_id' );
