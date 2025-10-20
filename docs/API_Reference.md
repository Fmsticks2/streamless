# API Reference

Smart Contract Interface
- create_plan(plan_id, amount, frequency_days)
- update_plan(plan_id, new_amount, new_freq)
- subscribe(plan_id, cycles)
- cancel_subscription(plan_id)
- execute_payment(subscriber, plan_id)
- get_plan(plan_id)
- get_user_subscriptions(user)

Frontend Contracts Service
- listPlans()
- createPlan()
- subscribe()
- cancelSubscription()
- getUserSubscriptions()
- getPaymentHistory()