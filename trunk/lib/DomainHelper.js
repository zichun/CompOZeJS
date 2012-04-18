/**
 * Static methods that operates on domains (mostly from fd.js)
 */
var DomainHelper = {
	FD_SUP:  100000000,
	
	/**
	 * Ensure that a domain is not empty
	 */
	domain_non_empty: function(dom) {
        if (dom.length === 0) { throw 'fail'; }
        return dom;
	},
	
	/**
	 * Convert an array list to a domain
	 */
	list_to_domain: function(list) {
		var i, tr = [];
		if (!list || !list.length) throw("Invalid list given!");
		list.sort(function (d1, d2) { return d1 - d2 });
		var pre = list[0], start = list[0];
		for (i=1;i<list.length;++i) {
			if (list[i] === pre) continue;
			if (list[i] !== pre+1) {
				tr.push( [start,pre] );
				start=pre=list[i];
			} else {
				pre = list[i];
			}
		}
		tr.push([start,pre]);
		return tr;
	},
	
	/**
	 * Converts a domain to a list contain its items
	 */
	domain_to_list: function(dom) {
		var tr = [];
		for (var i=0;i<dom.length;++i) {
			for (var j=dom[i][0];j<=dom[i][1];++j) {
				tr.push(j);
			}
		}
		return tr;
	},
	
	/**
	 * Intersects two domains (from fd.js)
	 */
    domain_intersection: function(dom1, dom2, r) {
        var i, j, len1, len2, b1, b2, d1, d2, d3, d4, d, mx, mn;

        if (dom1.length === 0 || dom2.length === 0) {
            return r || [];
        }

        if (dom1.length === 1) {
            if (dom2.length === 1) {
                b1 = dom1[0];
                b2 = dom2[0];
                mn = b1[0] > b2[0] ? b1[0] : b2[0];
                mx = b1[1] < b2[1] ? b1[1] : b2[1];
                r = r || [];
                if (mx >= mn) {
                    r.push([mn, mx]);
                }
                return r;
            } else {
                return domain_intersection(dom2, dom1, r);
            }
        } else {
            if (dom2.length === 1) {
                mn = dom2[0][0];
                mx = dom2[0][1];
                r = r || [];
                for (i = 0, len1 = dom1.length; i < len1; ++i) {
                    d = dom1[i];
                    if (d[0] <= mx && d[1] >= mn) {
                        r.push([(mn > d[0] ? mn : d[0]), (mx < d[1] ? mx : d[1])]);
                    }
                }
                return r;
            } else {
                // Worst case. Both lengths are > 1. Divide and conquer. 
                i = dom1.length >> 1;
                j = dom2.length >> 1;
                d1 = dom1.slice(0, i);
                d2 = dom1.slice(i);
                d3 = dom2.slice(0, j);
                d4 = dom2.slice(j);
                d = domain_intersection(d1, d3, r);
                d = domain_intersection(d1, d4, d);
                d = domain_intersection(d2, d3, d);
                d = domain_intersection(d2, d4, d);
                return r ? d : simplify_domain(d);
            }
        }
    },

	/**
	 * Simplify a domain (from fd.js)
	 */
    simplify_domain: function(d) {
        if (d.length === 0) {
            return d;
        }

        if (d.length === 1) {
            if (d[0][1] < d[0][0]) {
                return [];
            } else {
                return d;
            }
        }

        var result = [];
        var i, len, prev, prevL, prevR, next, nextL, nextR;

        // Find the first index from which we need to do the
        // simplification. If at the end of this loop i >= len,
        // then we need to do nothing and we avoid loading the GC.
        // This loop checks for overlaps and ordering issues.
        prevL = d[0][0]; prevR = d[0][1];
        i = 0; len = d.length;
        if (prevR >= prevL) {
            for (i = 1; i < len; ++i) {
                next = d[i];
                if (next[1] < next[0] || next[0] <= prevR || next[1] <= prevR) {
                    break;
                } else {
                    prevR = next[1];
                }
            }
        }

        if (i >= len) {
            // Nothing to do.
            return d;
        }

        d.sort(function (d1, d2) { return d1[0] - d2[0]; });
        result.push(prev = d[0]);

        for (i = 1, len = d.length; i < len; ++i) {
            next = d[i];
            if (prev[1] >= next[0]) {
                // Two consecutive domains that are at least touching.
                // Merge them.
                prev[1] = Math.max(prev[1], next[1]);
            } else {
                result.push(prev = next);
            }
        }

        d.splice(0, d.length);
        d.push.apply(d, result);
        return result;
    },

	/**
	 * Return an array (pair) containing the bounds of the domain
	 */
    domain_bounds: function(d) {
        if (d.length > 0) {
            return [d[0][0], d[d.length-1][1]];
        } else {
            throw 'fail';
        }
    },

	/**
	 * Checks if two domains are equal
	 */
    domain_equal: function(d1, d2) {
        if (d1.length != d2.length) {
            return false;
        }

        var i, len;
        for (i = 0, len = d1.length; i < len; ++i) {
            if (d1[i][0] != d2[i][0] || d1[i][1] != d2[i][1]) {
                return false;
            }
        }

        return true;
    },

    // The complement of a domain is such that domain U domain' = [[0, FD_SUP]].
    domain_complement: function(d) {
        if (d.length === 0) {
            return [[0, DomainHelper.FD_SUP]];
        } else {
            var end = 0;
            var result = [];
            var i, len;
            for (i = 0, len = d.length; i < len; ++i) {
                if (end < d[i][0]) {
                    result.push([end, d[i][0] - 1]);
                }
                end = d[0][1] + 1;
            }
            if (end < DomainHelper.FD_SUP) {
                result.push([end, DomainHelper.FD_SUP]);
            }
            return result;
        }
    }, 

    // The union of two domains contains all the intervals in either domain.
    domain_union: function(d1, d2) {
        var result = [];
        result.push.apply(result, d1);
        result.push.apply(result, d2);
        return simplify_domain(result);
    }
};
