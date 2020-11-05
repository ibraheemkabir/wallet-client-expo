import Connector from "@walletconnect/core";
import { IWalletConnectOptions, IPushServerOptions } from "@walletconnect/types";
import * as cryptoLib from "./iso_patch";

class WalletConnect extends Connector {
  constructor(connectorOpts: IWalletConnectOptions, pushServerOpts?: IPushServerOptions) {
    super({
      cryptoLib,
      connectorOpts,
      pushServerOpts,
    });
  }
}

export default WalletConnect;
