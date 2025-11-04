<?php

namespace Bluehost;

use wpdb;

/**
 * @coversDefaultClass \Bluehost\AutoIncrement
 */
class AutoIncrementWPUnitTest extends \lucatume\WPBrowser\TestCase\WPTestCase {

	protected $wpdb;
	protected $prefix;
	protected $charset_collate;

	protected function setUp(): void {
		parent::setUp();

		/** @var wpdb $wpdb */
		global $wpdb;

		$this->wpdb = $wpdb;

		$this->prefix          = $wpdb->prefix;
		$this->charset_collate = $wpdb->get_charset_collate();

		require_once codecept_root_dir( 'inc/AutoIncrement.php' );
	}

    protected function tearDown(): void
    {
        parent::tearDown();

        // Clean up any test tables created during the tests
        global $wpdb;
        $wpdb->query(
            $wpdb->prepare(
                'DROP TABLE %i',
                array(
                    $this->prefix . 'test_options',
                )
            )
        );

    }

    protected function create_broken_table( string $unprefixed_test_table_name ): void {
		$prefixed_test_table_name = $this->prefix . $unprefixed_test_table_name;

		$create_broken_table = <<<SQL
CREATE TABLE `{$prefixed_test_table_name}` (
  `option_id` bigint unsigned NOT NULL,
  `option_name` varchar(191) DEFAULT '',
  `option_value` longtext NOT NULL,
  `autoload` varchar(20) NOT NULL DEFAULT 'yes',
  KEY `autoload` (`autoload`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 $this->charset_collate
SQL;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';
		dbDelta( $create_broken_table );
	}

	public function test_add_missing_autoincrement(): void {
		$unprefixed_test_table_name = 'test_options';

		$this->create_broken_table( $unprefixed_test_table_name );

		$sut = new AutoIncrement( $this->wpdb );

		$this->assertFalse( $sut->has_autoincrement( $unprefixed_test_table_name, 'option_id' ) );

		$sut->fix_auto_increment( $unprefixed_test_table_name, 'option_id' );

		$this->assertTrue( $sut->has_autoincrement( $unprefixed_test_table_name, 'option_id' ) );
	}

	public function test_update_id_of_entries(): void {
		$unprefixed_test_table_name = 'test_options';
		$this->create_broken_table( $unprefixed_test_table_name );

		/** @var wpdb $wpdb */
		$wpdb = $this->wpdb;
		for ( $i = 1; $i <= 10; $i++ ) {
			$wpdb->query(
				$wpdb->prepare(
					"INSERT INTO %i VALUES (0, %s, 'value', true)",
					array(
						$this->prefix . $unprefixed_test_table_name,
						"key{$i}",
					)
				)
			);
		}

		$sut = new AutoIncrement( $this->wpdb );
		$sut->fix_auto_increment( $unprefixed_test_table_name, 'option_id' );

		$result = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT * FROM %i',
				array(
					$this->prefix . $unprefixed_test_table_name,
				)
			),
			ARRAY_A
		);

		$this->assertCount( 10, $result );

		$ids = wp_list_pluck( $result, 'option_id' );
		$this->assertCount( 10, array_unique( $ids ) );
	}
}
