<?php
/**
 * Fix the prefixed autoloader to enable PSR-4 lookups.
 * 
 * Strauss generates an autoloader with setClassMapAuthoritative(true),
 * which prevents PSR-4 lookups. This script removes that call and ensures
 * PSR-4 mappings are properly configured in the getInitializer closure.
 */

$autoloadRealFile = __DIR__ . '/../vendor-prefixed/composer/autoload_real.php';
$autoloadStaticFile = __DIR__ . '/../vendor-prefixed/composer/autoload_static.php';

if (!file_exists($autoloadRealFile)) {
    // If the file doesn't exist, Strauss hasn't run yet or there are no packages to prefix
    // Check if there are actually packages configured to be prefixed
    $composerJson = __DIR__ . '/../composer.json';
    if (file_exists($composerJson)) {
        $composer = json_decode(file_get_contents($composerJson), true);
        $packages = $composer['extra']['strauss']['packages'] ?? [];
        if (!empty($packages)) {
            // Packages are configured but Strauss hasn't run - this is an error
            echo "Error: Prefixed autoloader not found but packages are configured for prefixing.\n";
            echo "Please run 'composer run-script prefix-namespaces' first.\n";
            exit(1);
        }
    }
    // No packages to prefix, so it's fine to skip
    echo "No packages configured for prefixing. Skipping fix.\n";
    exit(0);
}

// Fix autoload_real.php: Remove setClassMapAuthoritative(true)
$content = file_get_contents($autoloadRealFile);
$content = preg_replace(
    '/\s+\$loader->setClassMapAuthoritative\(true\);\s*\n/',
    "\n",
    $content
);
file_put_contents($autoloadRealFile, $content);

// Fix autoload_static.php: Ensure PSR-4 mappings are set in getInitializer
if (file_exists($autoloadStaticFile)) {
    $staticContent = file_get_contents($autoloadStaticFile);
    $needsFix = false;
    
    // Check if prefixDirsPsr4 is being set in the closure
    if (!preg_match('/\$loader->prefixDirsPsr4\s*=/', $staticContent)) {
        $needsFix = true;
        
        // Check if prefixLengthsPsr4 exists in static properties
        if (preg_match('/public static \$prefixLengthsPsr4/', $staticContent)) {
            // Add prefixDirsPsr4 to static properties first if missing
            if (!preg_match('/public static \$prefixDirsPsr4/', $staticContent)) {
                $staticContent = preg_replace(
                    '/(public static \$prefixLengthsPsr4 = array \(.*?\);)/s',
                    "$1\n\n    public static \$prefixDirsPsr4 = array (\n        'Bluehost\\\\\\\\Plugin\\\\\\\\WP\\\\\\\\MCP\\\\\\\\' => \n        array (\n            0 => __DIR__ . '/../wordpress/mcp-adapter/includes',\n        ),\n        'Bluehost\\\\\\\\Plugin\\\\\\\\Composer\\\\\\\\' => \n        array (\n            0 => __DIR__ . '/..' . '/composer',\n        ),\n    );",
                    $staticContent
                );
            }
        }
        
        // Now add prefixDirsPsr4 assignment in the getInitializer closure
        // Try to find where to insert it - after prefixLengthsPsr4 assignment
        if (preg_match('/\$loader->prefixLengthsPsr4 = /', $staticContent)) {
            $staticContent = preg_replace(
                '/(\$loader->prefixLengthsPsr4 = .*?;)\s*\n(\s*\$loader->classMap)/s',
                "$1\n            // Resolve relative paths to absolute paths\n            \$mcpPath = __DIR__ . '/../wordpress/mcp-adapter/includes';\n            \$resolvedMcpPath = realpath(\$mcpPath);\n            \$loader->prefixDirsPsr4 = array(\n                'Bluehost\\\\\\\\Plugin\\\\\\\\WP\\\\\\\\MCP\\\\\\\\' => array(\n                    \$resolvedMcpPath !== false ? \$resolvedMcpPath : \$mcpPath,\n                ),\n                'Bluehost\\\\\\\\Plugin\\\\\\\\Composer\\\\\\\\' => array(\n                    __DIR__ . '/..' . '/composer',\n                ),\n            );\n$2",
                $staticContent
            );
        } else {
            // If prefixLengthsPsr4 isn't being set, add both
            $staticContent = preg_replace(
                '/(return \\\\Closure::bind\(function \(\) use \(\$loader\) \{)/s',
                "$1\n            \$loader->prefixLengthsPsr4 = ComposerStaticInitfc263b861a3a821216a94f842c3a3e31::\$prefixLengthsPsr4;\n            // Resolve relative paths to absolute paths\n            \$mcpPath = __DIR__ . '/../wordpress/mcp-adapter/includes';\n            \$resolvedMcpPath = realpath(\$mcpPath);\n            \$loader->prefixDirsPsr4 = array(\n                'Bluehost\\\\\\\\Plugin\\\\\\\\WP\\\\\\\\MCP\\\\\\\\' => array(\n                    \$resolvedMcpPath !== false ? \$resolvedMcpPath : \$mcpPath,\n                ),\n                'Bluehost\\\\\\\\Plugin\\\\\\\\Composer\\\\\\\\' => array(\n                    __DIR__ . '/..' . '/composer',\n                ),\n            );",
                $staticContent
            );
        }
    }
    
    // Also check if prefixLengthsPsr4 static property exists
    if (!preg_match('/public static \$prefixLengthsPsr4/', $staticContent)) {
        $needsFix = true;
        // Add prefixLengthsPsr4 static property before classMap
        $staticContent = preg_replace(
            '/(class ComposerStaticInit[^\s]+.*?\{)/s',
            "$1\n    public static \$prefixLengthsPsr4 = array (\n        'B' => \n        array (\n            'Bluehost\\\\\\\\Plugin\\\\\\\\WP\\\\\\\\MCP\\\\\\\\' => 24,\n            'Bluehost\\\\\\\\Plugin\\\\\\\\Composer\\\\\\\\' => 27,\n        ),\n    );\n\n    public static \$prefixDirsPsr4 = array (\n        'Bluehost\\\\\\\\Plugin\\\\\\\\WP\\\\\\\\MCP\\\\\\\\' => \n        array (\n            0 => __DIR__ . '/../wordpress/mcp-adapter/includes',\n        ),\n        'Bluehost\\\\\\\\Plugin\\\\\\\\Composer\\\\\\\\' => \n        array (\n            0 => __DIR__ . '/..' . '/composer',\n        ),\n    );\n",
            $staticContent
        );
    }
    
    if ($needsFix || !preg_match('/\$loader->prefixDirsPsr4\s*=/', $staticContent)) {
        file_put_contents($autoloadStaticFile, $staticContent);
    }
}

echo "Fixed prefixed autoloader: removed setClassMapAuthoritative(true) and ensured PSR-4 mappings\n";

