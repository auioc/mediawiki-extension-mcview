<?php

if (function_exists('wfLoadExtension')) {
    wfLoadExtension('MCView');
    wfWarn(
        'Deprecated PHP entry point used for MCView extension. Please use wfLoadExtension '.
        'instead, see https://www.mediawiki.org/wiki/Extension_registration for more details.'
    );

    return true;
} else {
    die('This version of the MCView extension requires MediaWiki 1.25+');
}
