<?php

class MCViewHooks
{
    public static function onParserFirstCallInit(Parser $parser)
    {
        global $wgOut,$wgMCViewMapFile;

        $wgOut->addJsConfigVars('wgMCViewMapFile', $wgMCViewMapFile);

        $parser->setHook('mcview', __CLASS__.'::mcViewRender');
        $parser->setHook('mcfont', __CLASS__.'::mcFontRender');
    }

    public static function mcViewRender($input, array $args, Parser $parser, PPFrame $frame)
    {
        $parser->getOutput()->addModules('ext.MCView.view');
        $parser->getOutput()->addModules('ext.MCView.font');

        $raw_data = json_decode($input);
        if (json_last_error() != JSON_ERROR_NONE) {
            return Html::Element(
                'div',
                ['class' => 'mcview-error'],
                '[MCViewS]Parsing failed: Invalid JSON data'
            );
        }

        return Html::rawElement(
            'div',
            [
                'class' => 'mcview-wrapper mcview-'.$args['type'],
                'data-mcview-type' => $args['type'],
            ],
            Html::Element(
                'div',
                ['class' => 'mcview-data'],
                json_encode($raw_data, JSON_UNESCAPED_UNICODE)
            )
        );
    }

    public static function mcFontRender($input, array $args, Parser $parser, PPFrame $frame)
    {
        $parser->getOutput()->addModules('ext.MCView.font');

        $sga = '';
        $style = '';
        if (isset($args['sga'])) {
            $sga = ' sga';
        }
        if (isset($args['style'])) {
            $style = 'style="'.$args['style'].'"';
        }

        $output = $parser->recursiveTagParse($input, $frame);

        return '<span class="mcfont'.$sga.'"'.$style.'>'.$output.'</span>';
    }
}
