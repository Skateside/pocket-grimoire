<?php

namespace App\Enums;

class TPIURLEnum
{
    /**
     * @var string Location of the app string translations.
     */
    const APP = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/app/%1$s.json';
    
    /**
     * @var string Location of the game string translations.
     */
    const GAME = 'https://raw.githubusercontent.com/ThePandemoniumInstitute/botc-translations/refs/heads/main/game/%1$s.json';

    /**
     * @var string Location of the TPI jinxes data.
     */
    const JINXES = 'https://release.botc.app/resources/data/jinxes.json';
    
    /**
     * @var string Location of the TPI night sheet data.
     */
    const NIGHTSHEET = 'https://release.botc.app/resources/data/nightsheet.json';
    
    /**
     * @var string Location of the TPI roles data.
     */
    const ROLES = 'https://release.botc.app/resources/data/roles.json';
}
