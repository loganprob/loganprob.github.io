import json
import datetime as dt

def dump_stats(table_data:list[dict], path='stats.json'):
    stats = {
        'updated': dt.datetime.now(dt.UTC).strftime('%Y-%m-%d %H:%M'),
        'table': table_data}
    with open(path, 'w') as f:
        f.write(json.dumps(stats))
    return

dummy_fund_data = [
    {'ticker':'BJAN', 'delta':1, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BFEB', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BMAR', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BAPR', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BMAY', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BJUN', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BJUL', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BAUG', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BSEP', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BOCT', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BNOV', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
    {'ticker':'BDEC', 'delta':0, 'vega':0, 'theta':0, 'rho':0},
]

if __name__=='__main__':
    dump_stats(dummy_fund_data)