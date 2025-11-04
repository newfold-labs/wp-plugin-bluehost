<?php

/**
 * Fix missing AUTO_INCREMENT on wp_options.option_id if removed accidentally.
 *
 * This routine checks the wp_options table and ensures that
 * the `option_id` column is correctly set as an AUTO_INCREMENT primary key.
 *
 * Safe to run multiple times — it will only alter the table if needed.
 */
function hiive_fix_wp_options_auto_increment() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'options';

    // Get the current column definition for `option_id`.
    $column_info = $wpdb->get_row( "SHOW COLUMNS FROM {$table_name} LIKE 'option_id'" );

    if ( ! $column_info ) {
        return;
    }

    // Check if the column has AUTO_INCREMENT.
    $has_auto_increment = strpos( $column_info->Extra, 'auto_increment' ) !== false;

    if ( $has_auto_increment ) {
        return;
    }


    // Step 1: Check if there are rows with id = 0.
    $zero_id_rows = $wpdb->get_results( "SELECT option_id FROM {$table_name} WHERE option_id = 0" );

    if ( ! empty( $zero_id_rows ) ) {
        // Find current max ID.
        $max_id = (int) $wpdb->get_var( "SELECT MAX(option_id) FROM {$table_name}" );

        // Increment and fix zero-id rows.
        foreach ( $zero_id_rows as $row ) {
            $max_id++;
            $wpdb->query( $wpdb->prepare(
                "UPDATE {$table_name} SET option_id = %d WHERE option_id = 0 LIMIT 1",
                $max_id
            ));
        }
    }

    // Step 2: Fix the column definition — Apply AUTO_INCREMENT safely.
    $wpdb->query( "ALTER TABLE {$table_name} MODIFY COLUMN option_id bigint(20) unsigned NOT NULL auto_increment;" );
}

hiive_fix_wp_options_auto_increment();
