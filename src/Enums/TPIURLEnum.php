<?php

namespace App\Enums;

enum TPIURLEnum: string
{
    /**
     * Location of the app string translations.
     */
    case APP = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/app/%1$s.json';
    
    /**
     * Location of the game string translations.
     */
    case GAME = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/game/%1$s.json';

    /**
     * Location of the TPI jinxes data.
     */
    case JINXES = 'https://release.botc.app/resources/data/jinxes.json';
    
    /**
     * Location of the TPI night sheet data.
     */
    case NIGHTSHEET = 'https://release.botc.app/resources/data/nightsheet.json';
    
    /**
     * Location of the TPI roles data.
     */
    case ROLES = 'https://release.botc.app/resources/data/roles.json';
}
