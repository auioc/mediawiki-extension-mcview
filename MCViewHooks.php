<?php

class MCViewHooks
{
    public static function onParserFirstCallInit(Parser $parser)
    {
        $parser->setHook('mcfont', __CLASS__.'::mcFontRender');
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
