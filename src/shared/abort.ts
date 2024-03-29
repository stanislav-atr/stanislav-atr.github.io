/**
 * @fileoverview There are some unfortunate cases where throwing inside a script is necessary
 * for seamless user experience. When a popunder script tries to replicate a window to a popup
 * and navigate the window to some ads landing page, it usually uses methods of `location` object
 * and we cannot add a layer of check on those methods (they are all non-configurable).
 * See https://github.com/AdguardTeam/PopupBlocker/issues/14, nothing prevent from popunder scripts
 * using it at any time. Currently, the only reliable way is to abort script execution on an attempt
 * to open a popup window which must happen before calling `location` methods.
 * To do so, during popup detection, we additionaly checks if the target of the popup is identical
 * to the current window or `href` attribute of a clicked anchor, and triggers aborting in such cases.
 */

import { ProxyServiceExternalError } from '../proxy/ProxyServiceExternalError';
import { log } from './debug';
import { translator } from '../i18n';

let externalErrorId:string;

export function abort():never {
    log.closeAllGroup();
    externalErrorId = Math.random().toString(36).substr(7);
    // eslint-disable-next-line no-console
    console.warn(translator.getMessage('aborted_popunder_execution'));
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw new ProxyServiceExternalError(externalErrorId);
}
