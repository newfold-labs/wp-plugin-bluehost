<?php

use NewfoldLabs\WP\Module\Performance\Cache\CachePurgingService;
use NewfoldLabs\WP\Module\Performance\Cache\Types\File;

// Remove the file-based caching rules from the .htaccess file
File::removeRules();

// Purge the file-based cache
( new CachePurgingService( array( new File() ) ) )->purge_all();
