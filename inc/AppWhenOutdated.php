<?php
/**
 * Render the app when the plugin is outdated.
 *
 * @package WPPluginBluehost
 */

namespace Bluehost;

global $wp_version;
$plugin_data = get_plugin_data( BLUEHOST_PLUGIN_FILE );
?>
<div id="wppbh-app-x" class="wppbh wppbh_app">
	<div class="nfd-root">
		<div class="wppbh-app-container min-[783px]:nfd-p-8 min-[783px]:nfd-flex nfd-gap-6 nfd-max-w-full xl:nfd-max-w-screen-xl 2xl:nfd-max-w-screen-2xl nfd-my-0">
			<main id="wppbh-app-outdated" class="wpadmin-brand-bluehost wppbh-page-home nfd-w-full nfd-p-4 min-[783px]:nfd-p-0">
				<div class="wppbh-app-body">
					<header class="nfd-mb-6">
						<div class="wppbh-logo-wrap">
							<a href="#" aria-label="Bluehost" class="components-button logo-mark nfd-p-0 has-icon" style="width: 160px; height: auto;">
								<span class="nfd-sr-only">Bluehost</span>
								<img 
									src="<?php echo esc_url( BLUEHOST_PLUGIN_URL . 'assets/svg/bluehost-logo.svg' ); ?>"
									alt="Bluehost" class="logo-mark__image" width="160" height="auto"
								/>
							</a>
						</div>
					</header>
					<div class="wppbh-app-body-inner">
						<div class="nfd-page wppbh-home">
							<div class="nfd-container">
							<div class="nfd-app-section-container nfd-bg-white nfd-w-full nfd-rounded-lg" >
								<div class="nfd-app-section-header nfd-p-8 nfd-border-b nfd-border-line nfd-flex nfd-flex-col nfd-items-baseline nfd-gap-4">
									<div class="nfd-gap-3">
										<h2 class="nfd-text-2xl nfd-font-medium nfd-text-title">
											<?php esc_html_e( 'WordPress Update Required', 'wp-plugin-bluehost' ); ?>
										</h2>
									</div>
									<div class="nfd-app-section-content">
										<div class="nfd-pb-8">
											<p class="nfd-pb-4"><?php esc_html_e( 'There are new WordPress components which this plugin requires in order to render the interface.', 'wp-plugin-bluehost' ); ?></p>
											<p class="nfd-pb-4">
												<?php esc_html_e( 'Your current version is outdated.', 'wp-plugin-bluehost' ); ?>
												<?php esc_html_e( 'Please update to a newer WordPress version.', 'wp-plugin-bluehost' ); ?>
											</p>
											<ul>
												<li>
													<?php esc_html_e( 'Your current WordPress version:', 'wp-plugin-bluehost' ); ?>
													<strong style="color: var(--color-error);"><?php echo esc_html( $wp_version ); ?></strong>
												</li>
												<li>
													<?php esc_html_e( 'Minimum required WordPress version:', 'wp-plugin-bluehost' ); ?>
													<strong style="color: var(--color-success);"><?php echo esc_html( $plugin_data['RequiresWP'] ); ?></strong>
												</li>
											</ul>
										</div>
										<div class="nfd-px-4 nfd-py-2 nfd-rounded-lg nfd-bg-canvas nfd-flex nfd-flex-row nfd-justify-between nfd-items-center nfd-gap-4 nfd-border">
											<div class="nfd-flex-1">
												<span class="nfd-alert__message">
													<span class="dashicons dashicons-info-outline"></span>
													<?php __( 'Consider enabling auto-updates to stay up to date.', 'wp-plugin-bluehost' ); ?>
												</span>
											</div>
											<div class="nfd-flex-none nfd-gap-4 nfd-flex nfd-flex-col">
												<a class="nfd-button nfd-button--primary nfd-flex nfd-gap-2 nfd-items-center" href="<?php echo esc_url( admin_url( 'update-core.php' ) ); ?>">
													<?php esc_html_e( 'Update Now', 'wp-plugin-bluehost' ); ?>
													<span class="dashicons dashicons-update"></span>
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
</div>