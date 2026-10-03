<?php

namespace App\Enums;

enum CommunityTranslationEnum: string
{
    /**
     * Location of the community translations for roles.
     */
    case ROLES = 'https://docs.google.com/spreadsheets/d/1aAJdqSTafHnw01w-WZ94UPx1Me70Kz-EG1NFfBht2tA/gviz/tq?tqx=out:csv&sheet=%1$s';

    /**
     * Location of the community translations for jinxes.
     */
    case JINXES = 'https://docs.google.com/spreadsheets/d/193DMlJzVSzArj1hV1DF6jcr-NsGRaecAy1ahLflu-Qo/gviz/tq?tqx=out:csv&sheet=%1$s';
}
