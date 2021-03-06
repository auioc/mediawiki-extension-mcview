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

        $data = '';
        if ($args['type'] == 'itemicon') {
            $data = json_encode([id => $input]);
        } else {
            $raw_data = json_decode($input);
            if (json_last_error() != JSON_ERROR_NONE) {
                return Html::Element(
                    'div',
                    ['class' => 'mcview-error'],
                    '[MCViewS]Parsing failed: Invalid JSON data'
                );
            }
            $data = json_encode($raw_data, JSON_UNESCAPED_UNICODE);
        }

        return Html::rawElement(
            'div',
            [
                'class' => 'mcview-wrapper mcview-type-'.$args['type'],
                'data-mcview-type' => $args['type'],
            ],
            Html::Element(
                'div',
                ['class' => 'mcview-data'],
                $data
            )
        );
    }

    public static function mcFontRender($input, array $args, Parser $parser, PPFrame $frame)
    {
        $parser->getOutput()->addModules('ext.MCView.font');

        $font = '';
        $style = '';
        if (isset($args['unifont'])) {
            $font = ' unifont';
        } elseif (isset($args['sga'])) {
            $font = ' sga';
        }
        if (isset($args['style'])) {
            $style = 'style="'.$args['style'].'"';
        }

        $output = $parser->recursiveTagParse($input, $frame);

        return '<span class="mcfont'.$font.'"'.$style.'>'.$output.'</span>';
    }
}
