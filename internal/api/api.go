package api

import (
	"context"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

var cli = limitedHTTPClient()
var ttl = time.Duration(0)
var token = "<token>"

func SetTTL(t time.Duration) {
	ttl = t
}

func SetToken(t string) {
	token = t
}

func limitedHTTPClient() *http.Client {
	fiveMinuteLimiter := rate.NewLimiter(rate.Every(time.Minute*5/3900), 3600)
	hourLimiter := rate.NewLimiter(rate.Every(time.Hour/36000), 36000)

	return &http.Client{
		Transport: rateLimitedRoundTripper{originalTransport: http.DefaultTransport, fiveMinuteLimiter: fiveMinuteLimiter, hourLimiter: hourLimiter},
	}
}

type rateLimitedRoundTripper struct {
	originalTransport http.RoundTripper
	fiveMinuteLimiter *rate.Limiter
	hourLimiter       *rate.Limiter
}

func (rt rateLimitedRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	for !rt.fiveMinuteLimiter.Allow() || !rt.hourLimiter.Allow() {
		if err := sleepWithContext(req.Context(), time.Second); err != nil {
			return nil, err
		}
	}

	return rt.originalTransport.RoundTrip(req)
}

func sleepWithContext(ctx context.Context, d time.Duration) error {
	select {
	case <-time.After(d):
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

type cacheItem[T any] struct {
	item   T
	expire time.Time
}

type cache[T any] struct {
	mutex sync.Mutex
	items map[string]cacheItem[T]
}

func newCache[T any]() cache[T] {
	return cache[T]{
		items: map[string]cacheItem[T]{},
	}
}

func (c *cache[T]) Load(key string) (res T, ok bool) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	item, ok := c.items[key]
	if !ok {
		return res, false
	}

	if time.Now().After(item.expire) {
		return res, false
	}

	return item.item, true
}

func (c *cache[T]) Store(key string, item T) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	c.items[key] = cacheItem[T]{
		item:   item,
		expire: time.Now().Add(ttl),
	}
}
