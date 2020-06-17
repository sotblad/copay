import { Injectable } from '@angular/core';

// Providers
import { BwcProvider } from '../../providers/bwc/bwc';

@Injectable()
export class AddressProvider {
  private bitcore: any;
  private bitcoreCash: any;
  private Bitcore: any;

  constructor(
    private bwcProvider: BwcProvider,
  ) {
    this.bitcore = this.bwcProvider.getBitcore();
    this.bitcoreCash = this.bwcProvider.getBitcoreCash();
    this.Bitcore = {
      'mue': {
        lib: this.bitcore,
        translateTo: 'bch'
      },
      'bch': {
        lib: this.bitcoreCash,
        translateTo: 'mue'
      }
    };
  }

  getCoin(address: string) {
    try {
      new this.Bitcore['mue'].lib.Address(address);
      return 'mue';
    } catch (e) {
      try {
        new this.Bitcore['bch'].lib.Address(address);
        return 'bch';
      } catch (e) {
        return null;
      }
    }
  };

  translateAddress(address: string) {
    var origCoin = this.getCoin(address);
    if (!origCoin) return;

    var origAddress = new this.Bitcore[origCoin].lib.Address(address);
    var origObj = origAddress.toObject();

    var resultCoin = this.Bitcore[origCoin].translateTo;
    var resultAddress = this.Bitcore[resultCoin].lib.Address.fromObject(origObj);
    return {
      origCoin,
      origAddress: address,
      resultCoin,
      resultAddress: resultAddress.toString()
    };
  };

  validateAddress(address: string) {
    let Address = this.bitcore.Address;
    let AddressCash = this.bitcoreCash.Address;
    let isLivenet = Address.isValid(address, 'livenet');
    let isTestnet = Address.isValid(address, 'testnet');
    let isLivenetCash = AddressCash.isValid(address, 'livenet');
    let isTestnetCash = AddressCash.isValid(address, 'testnet');
    return {
      address,
      isValid: isLivenet || isTestnet || isLivenetCash || isTestnetCash,
      network: (isTestnet || isTestnetCash) ? 'testnet' : 'livenet',
      coin: this.getCoin(address),
      translation: this.translateAddress(address),
    };
  }
}
