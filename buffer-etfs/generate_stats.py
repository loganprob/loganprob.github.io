import sys
import json
import datetime as dt
import requests
import math
import xml.etree.ElementTree as ET
from scipy import optimize
import re


#################### YIELD CURVE RELATED ####################

def get_rate(spot_params:tuple, borrowing_term:float, forward_time:float=None) -> float:
    # forward-rate model comes from CFA L2 textbook
    b0,b1,b2,b3,d0,d1 = spot_params
    t = max(borrowing_term, 0.0027) # min term = one day, else division by zero
    if forward_time is None:
        return b0+b1*((1-math.exp(-t/d0))/(t/d0))+b2*((1-math.exp(-t/d0))/(t/d0)-math.exp(-t/d0))+b3*((1-math.exp(-t/d1))/(t/d1)-math.exp(-t/d1))
    else:
        longer_rate = (get_rate(spot_params, forward_time + t) + 1)**(forward_time + t)
        shorter_rate = (get_rate(spot_params, forward_time) + 1)**(forward_time)
        return (longer_rate/shorter_rate)**(1/t)-1
    
def fit_yield_curve(known_timerate_pairs:list[tuple]) -> tuple:
    # Nelson-Siegel-Svensson : https://en.wikipedia.org/wiki/Fixed-income_attribution#Modeling_the_yield_curve
    # NSS (exponential-polynomial) isn't perfect but works here
    # parameters have real-world interpretations, reliable, haven't seen it blow up (Runge) yet like some more accurate fitting function might
    guess = (0.026,0.029,0.019,0.058,0.745,13.67) # update periodically
    error_function = lambda params, known_rates: sum([(get_rate(params, t) - r)**2*(1/t) for t,r in known_rates]) # added (1/t) to emphasize shorter times
    result = optimize.minimize(error_function, guess, args=(known_timerate_pairs))
    return tuple(result['x'])

def bootstrap_spot_curve(par_params, max_time=2):
    spot_time, spot_rates = 0, []
    while spot_time < max_time:
        spot_time += 1/12
        coupon_rate = get_rate(par_params, spot_time)/12
        discounted_coupons = sum([(coupon_rate)/(1+r/12)**(t*12) for t,r in spot_rates])
        spot = 12*(((1+coupon_rate)/(1-discounted_coupons))**(1/(12*spot_time))-1)
        spot_rates.append((spot_time, spot))
    return spot_rates

def get_treasury_par_rates(as_of=dt.date.today()):
    as_of = max(min(as_of, dt.date.today()), dt.date(1990,1,2))
    url = f'https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value={as_of.year}'
    response = requests.get(url)
    if response.status_code!=200: 
        sys.exit(1)
    xmlns = { # I'm assuming these don't change too often...
        'main':'http://www.w3.org/2005/Atom',
        'm':'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
        'd':'http://schemas.microsoft.com/ado/2007/08/dataservices'}
    tags = { # older dates don't have all the times, so lookups are neccessary
        '1MONTH':1/12,'2MONTH':1/6,'3MONTH':1/4,'4MONTH':1/3,'6MONTH':1/2,'1YEAR':1,
        '2YEAR':2,'3YEAR':3,'5YEAR':5,'7YEAR':7,'10YEAR':10,'20YEAR':20,'30YEAR':30}
    root = ET.fromstring(response.content.decode())
    dated_elements = {dt.datetime.strptime(i.find('d:NEW_DATE', xmlns).text.split('T')[0], '%Y-%m-%d').date(): i for i in root.findall('main:entry/main:content/m:properties', xmlns)}
    as_of = max(min(as_of, max(dated_elements.keys())), min(dated_elements.keys()))
    return as_of, [(tags[t], float(r.text)/100) for t,r in [(tag, dated_elements[as_of].find(f'd:BC_{tag}', xmlns)) for tag in tags] if r is not None]

def get_flex_report(max_trys=3):
    report_date = dt.date.today()
    while max_trys>0:
        report_date += dt.timedelta(days=min(4-report_date.weekday(), 0))
        url = f'https://marketdata.theocc.com/flex-reports?reportType=PR&optionType=E&reportDate={report_date.strftime('%Y%m%d')}'
        response = requests.get(url)
        if response.status_code!=200 or 'File requested does not exist' in (full_report:=response.content.decode()):
            report_date -= dt.timedelta(days=1)
            max_trys -= 1
            continue
        # good response
        flex_quote_pattern = re.compile(r'\s*[24]SPY\s+([CP])\s+(\d{2} \d{2} \d{4})\s+([\d.]+)\s+([\d.]+)')
        parsed_quotes = {1:{}, -1:{}}
        for line in full_report.splitlines():
            if not (flex_quote_match:=flex_quote_pattern.match(line)):
                continue
            callput, expir, strike, mark = flex_quote_match.groups()
            callput, expir, strike, mark = (1 if callput=='C' else -1), dt.datetime.strptime(expir, '%m %d %Y').date(), float(strike), float(mark)
            if expir not in parsed_quotes[callput]:
                parsed_quotes[callput][expir] = {}
            parsed_quotes[callput][expir][strike] = mark 
        return parsed_quotes
    sys.exit(1)


def dump_stats(table_data:list[dict], path='stats.json'):
    stats = {
        'updated': dt.datetime.now(dt.UTC).strftime('%Y-%m-%d %H:%M'),
        'table': table_data}
    with open(path, 'w') as f:
        f.write(json.dumps(stats))
    return

dummy_fund_data = [
    {'ticker':'BJAN', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BFEB', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BMAR', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BAPR', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BMAY', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BJUN', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BJUL', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BAUG', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BSEP', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BOCT', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BNOV', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
    {'ticker':'BDEC', 'delta':'-', 'vega':'-', 'theta':'-', 'rho':'-'},
]


if __name__=='__main__':
    if dt.date.today().weekday() > 4:
        sys.exit(1) # non-zero exit status will prevent the .bat script from pushing to github

    trsy_date, trsy_par_rates = get_treasury_par_rates()
    par_curve_params = fit_yield_curve(trsy_par_rates)
    spot_curve_params = fit_yield_curve(bootstrap_spot_curve(par_curve_params))
    flex_quotes = get_flex_report()

    dump_stats(dummy_fund_data)