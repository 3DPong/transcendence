/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Validator.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/14 19:06:11 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/16 21:52:32 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assert } from './Assert';
import { DefaultConfig } from './Validator.config';
import { RuleConfigObject } from './Validator.config';
import { ConfigStruct } from './Validator.config';

abstract class AbstractValidator<T_rules> {
  protected abstract _configuration: T_rules;
  public abstract isAcceptable(ruleType: any, value: any): boolean;
  public abstract isContaining(ruleType: any, value: any): boolean;
  public constructor(config_file_location: any) {}
}

/*******************************************************
 *    여기서 부터는 외부로 export하는 모듈입니다.
 *******************************************************/

export class Validator extends AbstractValidator<ConfigStruct> {
  // Member Data
  protected _configuration: ConfigStruct = DefaultConfig as ConfigStruct;

  protected _getTargetRule(ruleType: string) {
    const target_rule = this._configuration.rules.find((element) => element[0] === ruleType);
    Assert.NonNullish(target_rule, '[from Validator]: Cannot find rules. check ruleType exists in configuration file.');
    return target_rule;
  }

  protected _getRegex(ruleType: string): RegExp {
    const regex_rule = (this._getTargetRule(ruleType)[1] as RuleConfigObject).regex as RegExp;
    Assert.NonNullish(regex_rule, '[from Validator]: Regex rule is null.');
    return regex_rule;
  }

  /**
   * Validator를 주어진 설정 모듈로 설정합니다.
   * @param object validator 설정 객체.
   */
  public setConfig(config: ConfigStruct) {
    this._configuration = config;
    /* !하단 dynamic import 코드에서 설정파일이 노출되는 문제가 발생하여 static-loading으로 수정함.
        import(`${location}`)
            .then((module) => {
                this._configuration = module;
            })
            .catch((err) => {
                alert(`[Validator]: '${location}' file open error.`);
            }); */
  }

  /**
   * 새로운 Validator instance를 생성합니다.
   * 이때 인자로 넘긴 설정파일이 Validator의 검증 규칙으로 사용됩니다.
   * @param config_file_location Validator 설정파일 위치.
   */
  public constructor(config: ConfigStruct = DefaultConfig) {
    super(config);
    this.setConfig(config);
  }

  // Getter
  public get configuration() {
    return this._configuration;
  }

  protected _getConfigObectByRule(ruleType: string) {
    return this._getTargetRule(ruleType)[1] as RuleConfigObject;
  }

  public getRuleHint(ruleType: string): string | undefined {
    return this._getConfigObectByRule(ruleType).hint;
  }
  /**
   * Regex 패턴과 문자열 전체가 일치하는지를 봅니다.
   * - @비밀번호 @아이디 등 문자열이 전체 규칙을 만족하는지 체크할 때 사용하세요.
   *
   * @param ruleType config.ts에서 설정한 규칙타입. (ex-@Name)
   * @param value 검사를 수행할 대상 문자열.
   * @returns 규칙에 통과했다면 true, 규칙에 어긋난다면 false를 반환.
   */
  public isAcceptable(ruleType: string, value: string): boolean {
    const regex_rule = this._getRegex(ruleType);
    if (value.match(regex_rule) === null) {
      // invalid
      return false;
    } else {
      // rule pass
      return true;
    }
  }

  /**
   * Regex 패턴에 문자열의 일부라도 해당하는지 체크합니다.
   * - @비속어 혹은 사용하면 안되는 단어가 있을 경우 아래 함수를 이용하세요.
   *
   * @param ruleType config.ts에서 설정한 규칙타입. (ex-@Name)
   * @param value 검사를 수행할 대상 문자열.
   * @returns 패턴에 해당하는 부분이 한개라도 존재한다면 true를 반환합니다.
   */
  public isContaining(ruleType: string, value: string): boolean {
    const regex_rule = this._getRegex(ruleType);
    if (value.search(regex_rule) === -1) {
      return false;
    } else {
      return true;
    }
  }
}
